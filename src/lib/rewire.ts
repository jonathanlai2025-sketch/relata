/**
 * Constructive clause rewiring.
 *
 * Archive contamination: proposing triples from a 2-hop neighborhood
 * inserts locality into the proposal kernel. Any geometrization is then
 * partly kinematic.
 *
 * Honest kernel: uniformly random triples. The action alone must concentrate
 * the posterior onto local clauses.
 */
import {
  diagnoseFrozenCoupling,
  PROTOCOL,
  type EnsembleReport,
  type GateKey,
  type Params,
} from "@/lib/experiment-zero";

export type RewireId = "overlap_uniform" | "overlap_two_hop";
export type ProposalKernel = "uniform" | "two_hop";

export const REWIRE_META: Record<
  RewireId,
  { name: string; role: string; blurb: string; kernel: ProposalKernel }
> = {
  overlap_uniform: {
    name: "Uniform triples",
    role: "Honest action test",
    blurb:
      "Candidate clauses drawn uniformly from C(N,3). Locality, if it appears, has to come from the action.",
    kernel: "uniform",
  },
  overlap_two_hop: {
    name: "2-hop pool (archive)",
    role: "Contaminated proposal",
    blurb:
      "Candidate triples drawn from a 2-hop neighborhood. Locality is partly inserted by the proposal, not derived.",
    kernel: "two_hop",
  },
};

export type CombinatorialDiag = {
  clustering: number;
  meanDegree: number;
  giantFrac: number;
  hausdorff: number;
  nClauses: number;
};

export type RewireReport = EnsembleReport & {
  kernel: ProposalKernel;
  gamma: number;
  combinatorial: CombinatorialDiag;
  contamination: boolean;
};

class Rng {
  private a: number;
  constructor(seed: number) {
    this.a = seed >>> 0;
  }
  next() {
    let a = (this.a + 0x6d2b79f5) | 0;
    this.a = a;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(n: number) {
    return Math.floor(this.next() * n);
  }
}

type Triple = [number, number, number];

function keyOf(t: Triple) {
  const a = t.slice().sort((x, y) => x - y);
  return `${a[0]},${a[1]},${a[2]}`;
}

function sortTriple(a: number, b: number, c: number): Triple {
  const t = [a, b, c].sort((x, y) => x - y);
  return [t[0]!, t[1]!, t[2]!];
}

function localClustering(adj: number[][]) {
  const n = adj.length;
  let acc = 0;
  let counted = 0;
  for (let i = 0; i < n; i++) {
    const nbr = adj[i]!;
    const k = nbr.length;
    if (k < 2) continue;
    let links = 0;
    for (let a = 0; a < k; a++) {
      const na = adj[nbr[a]!];
      for (let b = a + 1; b < k; b++) {
        if (na.includes(nbr[b]!)) links++;
      }
    }
    acc += (2 * links) / (k * (k - 1));
    counted++;
  }
  return counted ? acc / counted : 0;
}

function twoSection(n: number, clauses: Triple[]) {
  const adj: number[][] = Array.from({ length: n }, () => []);
  const add = (a: number, b: number) => {
    if (a === b) return;
    if (!adj[a]!.includes(b)) adj[a]!.push(b);
    if (!adj[b]!.includes(a)) adj[b]!.push(a);
  };
  for (const [a, b, c] of clauses) {
    add(a, b);
    add(b, c);
    add(c, a);
  }
  return adj;
}

function giantFrac(adj: number[][]) {
  const n = adj.length;
  const seen = new Uint8Array(n);
  let best = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    const stack = [s];
    seen[s] = 1;
    let size = 0;
    while (stack.length) {
      const u = stack.pop()!;
      size++;
      for (const v of adj[u]!) {
        if (!seen[v]) {
          seen[v] = 1;
          stack.push(v);
        }
      }
    }
    if (size > best) best = size;
  }
  return n ? best / n : 0;
}

function meanDeg(adj: number[][]) {
  let s = 0;
  for (const row of adj) s += row.length;
  return adj.length ? s / adj.length : 0;
}

function volume(adj: number[][], maxR = 6) {
  const n = adj.length;
  const acc = new Float64Array(maxR + 1);
  for (let src = 0; src < n; src++) {
    const dist = new Int16Array(n);
    dist.fill(-1);
    dist[src] = 0;
    const q = [src];
    let qi = 0;
    while (qi < q.length) {
      const u = q[qi++]!;
      for (const v of adj[u]!) {
        if (dist[v] < 0) {
          dist[v] = dist[u]! + 1;
          q.push(v);
        }
      }
    }
    for (let r = 0; r <= maxR; r++) {
      let c = 0;
      for (let i = 0; i < n; i++) if (dist[i] >= 0 && dist[i] <= r) c++;
      acc[r]! += c;
    }
  }
  for (let r = 0; r <= maxR; r++) acc[r]! /= n;
  return acc;
}

function hausdorff(vol: Float64Array) {
  const last = vol[vol.length - 1]!;
  const cap = 0.6 * last;
  const slopes: number[] = [];
  for (let r = 2; r < vol.length; r++) {
    if (vol[r]! >= cap) break;
    const d = Math.log(vol[r]! / Math.max(vol[r - 1]!, 1e-9)) / Math.log(r / (r - 1));
    if (Number.isFinite(d)) slopes.push(d);
  }
  if (!slopes.length) return Number.NaN;
  slopes.sort((a, b) => a - b);
  return slopes[Math.floor(slopes.length / 2)]!;
}

function hop2(adj: number[][], v: number) {
  const pool = new Set<number>([v, ...adj[v]!]);
  for (const u of adj[v]!) for (const w of adj[u]!) pool.add(w);
  return [...pool];
}

function overlapScore(adj: number[][], a: number, b: number, c: number) {
  const A = new Set(adj[a]);
  const B = new Set(adj[b]);
  const C = new Set(adj[c]);
  const jaccard = (x: Set<number>, y: Set<number>) => {
    let inter = 0;
    for (const k of x) if (y.has(k)) inter++;
    const uni = x.size + y.size - inter;
    return uni ? inter / uni : 0;
  };
  return (jaccard(A, B) + jaccard(A, C) + jaccard(B, C)) / 3;
}

function randomTriple(n: number, rng: Rng): Triple {
  let a = rng.int(n);
  let b = rng.int(n);
  let c = rng.int(n);
  let guard = 0;
  while ((a === b || a === c || b === c) && guard++ < 40) {
    a = rng.int(n);
    b = rng.int(n);
    c = rng.int(n);
  }
  return sortTriple(a, b, c);
}

function propose(kernel: ProposalKernel, n: number, adj: number[][], rng: Rng): Triple | null {
  if (kernel === "uniform") return randomTriple(n, rng);
  const v = rng.int(n);
  const pool = hop2(adj, v);
  if (pool.length < 3) return null;
  let a = pool[rng.int(pool.length)]!;
  let b = pool[rng.int(pool.length)]!;
  let c = pool[rng.int(pool.length)]!;
  let guard = 0;
  while ((a === b || a === c || b === c) && guard++ < 40) {
    a = pool[rng.int(pool.length)]!;
    b = pool[rng.int(pool.length)]!;
    c = pool[rng.int(pool.length)]!;
  }
  if (a === b || a === c || b === c) return null;
  return sortTriple(a, b, c);
}

function initRandomClauses(n: number, m: number, rng: Rng) {
  const have = new Set<string>();
  const clauses: Triple[] = [];
  let guard = 0;
  while (clauses.length < m && guard++ < m * 20) {
    const t = randomTriple(n, rng);
    const k = keyOf(t);
    if (have.has(k) || t[0] === t[1]) continue;
    have.add(k);
    clauses.push(t);
  }
  return { clauses, have };
}

function actionOf(adj: number[][], t: Triple, gamma: number, delta: number) {
  const ov = overlapScore(adj, t[0], t[1], t[2]);
  const deg =
    (adj[t[0]]!.length + adj[t[1]]!.length + adj[t[2]]!.length) / 3;
  // Lower is better: penalize low overlap (shortcut) and degree explosion.
  return -gamma * ov + delta * Math.max(0, deg - 6);
}

function adjToW(adj: number[][], n: number) {
  const w = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (const j of adj[i]!) {
      w[i * n + j] = 1;
    }
  }
  return w;
}

export class RewireSession {
  n: number;
  kernel: ProposalKernel;
  id: RewireId;
  gamma: number;
  delta: number;
  clauses: Triple[];
  have: Set<string>;
  adj: number[][];
  positions: Float64Array;
  stepCount = 0;
  rng: Rng;
  report: RewireReport | null = null;
  params: Params;
  attemptsPerStep: number;

  constructor(id: RewireId, params: Params, gamma = 1, delta = 0.25) {
    this.id = id;
    this.kernel = REWIRE_META[id].kernel;
    this.params = { ...params };
    this.n = params.n;
    this.gamma = gamma;
    this.delta = delta;
    this.rng = new Rng(params.seed + (id === "overlap_two_hop" ? 99 : 0));
    const m = Math.round(this.n * 1.6);
    const init = initRandomClauses(this.n, m, this.rng);
    this.clauses = init.clauses;
    this.have = init.have;
    this.adj = twoSection(this.n, this.clauses);
    this.attemptsPerStep = Math.max(8, this.n);
    this.positions = new Float64Array(this.n * 2);
    for (let i = 0; i < this.n; i++) {
      this.positions[i * 2] = this.rng.next() * 2 - 1;
      this.positions[i * 2 + 1] = this.rng.next() * 2 - 1;
    }
    for (let k = 0; k < 40; k++) this.relax(0.08);
  }

  step(count = 1) {
    for (let s = 0; s < count; s++) {
      for (let a = 0; a < this.attemptsPerStep; a++) this.metropolis();
      this.stepCount++;
    }
    this.relax(0.05);
  }

  metropolis() {
    const proposed = propose(this.kernel, this.n, this.adj, this.rng);
    if (!proposed) return;
    const pk = keyOf(proposed);
    if (this.have.has(pk)) return;
    if (!this.clauses.length) return;
    const idx = this.rng.int(this.clauses.length);
    const old = this.clauses[idx]!;
    const sOld = actionOf(this.adj, old, this.gamma, this.delta);
    const sNew = actionOf(this.adj, proposed, this.gamma, this.delta);
    const dS = sNew - sOld;
    if (dS > 0 && this.rng.next() > Math.exp(-4 * dS)) return;
    this.have.delete(keyOf(old));
    this.have.add(pk);
    this.clauses[idx] = proposed;
    this.adj = twoSection(this.n, this.clauses);
  }

  combinatorial(): CombinatorialDiag {
    const vol = volume(this.adj);
    return {
      clustering: localClustering(this.adj),
      meanDegree: meanDeg(this.adj),
      giantFrac: giantFrac(this.adj),
      hausdorff: hausdorff(vol),
      nClauses: this.clauses.length,
    };
  }

  runFull(): RewireReport {
    const remain = Math.max(0, this.params.steps - this.stepCount);
    this.step(remain);
    const comb = this.combinatorial();
    const w = adjToW(this.adj, this.n);
    const ev = diagnoseFrozenCoupling(w, this.params, this.params.seed + 17);
    const gates = ev.gates as Record<GateKey, boolean>;
    const contamination = this.kernel === "two_hop";
    this.report = {
      name: this.id,
      adaptive: true,
      giantFraction: ev.giant,
      persistJaccard: ev.persist,
      growthExponent: ev.growth,
      spectralDim: ev.spec,
      triangleHold: ev.tri,
      meanDegree: ev.deg,
      volumeGrowth: ev.vol,
      gates,
      passZero: ev.passZero,
      passGeometryHint: ev.passGeometryHint,
      meanM: 0,
      kernel: this.kernel,
      gamma: this.gamma,
      combinatorial: comb,
      contamination,
    };
    this.flatAdj = ev.adj;
    for (let k = 0; k < 40; k++) this.relax(0.08);
    return this.report;
  }

  flatAdj = new Uint8Array(0);

  nodes() {
    const out: { x: number; y: number; s: number }[] = [];
    for (let i = 0; i < this.n; i++) {
      out.push({ x: this.positions[i * 2]!, y: this.positions[i * 2 + 1]!, s: 1 });
    }
    return out;
  }

  edges() {
    const e: [number, number][] = [];
    for (let i = 0; i < this.n; i++) {
      for (const j of this.adj[i]!) if (i < j) e.push([i, j]);
    }
    return e;
  }

  heatmap() {
    return adjToW(this.adj, this.n);
  }

  relax(dt: number) {
    const { n, positions: p, adj } = this;
    const fx = new Float64Array(n);
    const fy = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      fx[i]! -= 0.02 * p[i * 2]!;
      fy[i]! -= 0.02 * p[i * 2 + 1]!;
      for (let j = i + 1; j < n; j++) {
        const dx = p[i * 2]! - p[j * 2]!;
        const dy = p[i * 2 + 1]! - p[j * 2 + 1]!;
        const d2 = dx * dx + dy * dy + 0.05;
        const inv = 0.04 / d2;
        fx[i]! += dx * inv;
        fy[i]! += dy * inv;
        fx[j]! -= dx * inv;
        fy[j]! -= dy * inv;
        const linked = adj[i]!.includes(j);
        if (linked) {
          fx[i]! += 0.14 * (p[j * 2]! - p[i * 2]!);
          fy[i]! += 0.14 * (p[j * 2 + 1]! - p[i * 2 + 1]!);
          fx[j]! -= 0.14 * (p[j * 2]! - p[i * 2]!);
          fy[j]! -= 0.14 * (p[j * 2 + 1]! - p[i * 2 + 1]!);
        }
      }
    }
    for (let i = 0; i < n; i++) {
      p[i * 2] = Math.max(-3, Math.min(3, p[i * 2]! + fx[i]! * dt * 6));
      p[i * 2 + 1] = Math.max(-3, Math.min(3, p[i * 2 + 1]! + fy[i]! * dt * 6));
    }
  }
}

export type SweepRow = {
  kernel: ProposalKernel;
  gamma: number;
  seed: number;
  clustering: number;
  hausdorff: number;
  giant: number;
  meanDegree: number;
  passZero: boolean;
  g4: boolean;
};

export function runProposalSweep(p: Params = { ...PROTOCOL, n: 24, steps: 28, trials: 8 }): SweepRow[] {
  const rows: SweepRow[] = [];
  const kernels: RewireId[] = ["overlap_uniform", "overlap_two_hop"];
  const gammas = [0, 1];
  const seeds = [1, 2, 3];
  for (const id of kernels) {
    for (const gamma of gammas) {
      for (const seed of seeds) {
        const sess = new RewireSession(id, { ...p, seed, steps: p.steps }, gamma, 0.25);
        sess.step(p.steps);
        const comb = sess.combinatorial();
        rows.push({
          kernel: REWIRE_META[id].kernel,
          gamma,
          seed,
          clustering: comb.clustering,
          hausdorff: comb.hausdorff,
          giant: comb.giantFrac,
          meanDegree: comb.meanDegree,
          passZero: false,
          g4: Number.isFinite(comb.hausdorff) && comb.hausdorff >= 0.6 && comb.hausdorff <= 4.8,
        });
      }
    }
  }
  return rows;
}

export function summarizeSweep(rows: SweepRow[]) {
  const groups = new Map<string, SweepRow[]>();
  for (const r of rows) {
    const k = `${r.kernel}|γ=${r.gamma}`;
    const arr = groups.get(k) ?? [];
    arr.push(r);
    groups.set(k, arr);
  }
  const out: {
    label: string;
    kernel: ProposalKernel;
    gamma: number;
    clustering: number;
    hausdorff: number;
    note: string;
  }[] = [];
  for (const [label, arr] of groups) {
    const hs = arr.map((r) => r.hausdorff).filter((x) => Number.isFinite(x));
    const clustering = arr.reduce((s, r) => s + r.clustering, 0) / arr.length;
    const hausdorff = hs.length ? hs.reduce((s, x) => s + x, 0) / hs.length : Number.NaN;
    const kernel = arr[0]!.kernel;
    const gamma = arr[0]!.gamma;
    let note = "";
    if (kernel === "two_hop" && gamma === 0) {
      note =
        clustering > 0.12
          ? "Locality at γ=0: proposal, not action."
          : "2-hop at γ=0 did not cluster here — still a contaminated kernel.";
    } else if (kernel === "uniform" && gamma === 0) {
      note = "Baseline random 3-uniform. Action off.";
    } else if (kernel === "uniform" && gamma === 1) {
      note = "Honest test. If this is not more local than uniform γ=0, the action failed.";
    } else {
      note = "Contaminated kernel with action on. Do not credit the action.";
    }
    out.push({ label, kernel, gamma, clustering, hausdorff, note });
  }
  return out;
}
