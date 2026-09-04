/**
 * Layer 0 as frozen: 3-uniform NAE, Metropolis, CRN intervention M.
 * Coordinates may build P1–P3 clauses, then are discarded.
 * Proposals that rewire are uniformly random triples. 2-hop is illegal.
 */

export type ControlId = "C0" | "C1" | "C2" | "C3" | "P1" | "P2" | "P3";
export type Layer0Id = ControlId | "frustrated_uniform";

export type Triple = [number, number, number];

export class Rng {
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
  fork() {
    return new Rng((this.next() * 0xffffffff) >>> 0);
  }
}

function sort3(a: number, b: number, c: number): Triple {
  let x = a, y = b, z = c;
  if (x > y) [x, y] = [y, x];
  if (y > z) [y, z] = [z, y];
  if (x > y) [x, y] = [y, x];
  return [x, y, z];
}

function keyOf(t: Triple) {
  return `${t[0]},${t[1]},${t[2]}`;
}

export function randomTriple(n: number, rng: Rng): Triple {
  let a = rng.int(n);
  let b = rng.int(n - 1);
  if (b >= a) b++;
  let c = rng.int(n - 2);
  if (c >= Math.min(a, b)) c++;
  if (c >= Math.max(a, b)) c++;
  return sort3(a, b, c);
}

export type Hypergraph = {
  n: number;
  clauses: Triple[];
  index: Map<string, number>;
  incident: number[][];
};

function buildGraph(n: number, clauses: Triple[]): Hypergraph {
  const index = new Map<string, number>();
  const incident: number[][] = Array.from({ length: n }, () => []);
  const uniq: Triple[] = [];
  for (const t of clauses) {
    const k = keyOf(t);
    if (index.has(k)) continue;
    index.set(k, uniq.length);
    uniq.push(t);
    incident[t[0]]!.push(uniq.length - 1);
    incident[t[1]]!.push(uniq.length - 1);
    incident[t[2]]!.push(uniq.length - 1);
  }
  return { n, clauses: uniq, index, incident };
}

/** P1 ring. Coordinates used to place (i,i+1,i+2), then discarded. */
export function makeP1(n: number): Hypergraph {
  const clauses: Triple[] = [];
  for (let i = 0; i < n; i++) clauses.push(sort3(i, (i + 1) % n, (i + 2) % n));
  return buildGraph(n, clauses);
}

/** P2 grid triangulation. Coords discarded after building faces. */
export function makeP2(n: number): Hypergraph {
  const L = Math.max(3, Math.floor(Math.sqrt(n)));
  const m = L * L;
  const id = (x: number, y: number) => (y % L) * L + (x % L);
  const clauses: Triple[] = [];
  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const a = id(x, y);
      const b = id(x + 1, y);
      const c = id(x, y + 1);
      const d = id(x + 1, y + 1);
      clauses.push(sort3(a, b, c));
      clauses.push(sort3(b, d, c));
    }
  }
  return buildGraph(m, clauses);
}

/** P3 3D grid: axis triples on each unit edge-path. Coords discarded. */
export function makeP3(n: number): Hypergraph {
  let L = Math.max(3, Math.floor(Math.cbrt(n)));
  const m = L * L * L;
  const id = (x: number, y: number, z: number) =>
    ((z + L) % L) * L * L + ((y + L) % L) * L + ((x + L) % L);
  const clauses: Triple[] = [];
  for (let z = 0; z < L; z++) {
    for (let y = 0; y < L; y++) {
      for (let x = 0; x < L; x++) {
        clauses.push(sort3(id(x, y, z), id(x + 1, y, z), id(x + 2, y, z)));
        clauses.push(sort3(id(x, y, z), id(x, y + 1, z), id(x, y + 2, z)));
        clauses.push(sort3(id(x, y, z), id(x, y, z + 1), id(x, y, z + 2)));
      }
    }
  }
  return buildGraph(m, clauses);
}

/** C1 random 3-uniform at given mean vertex degree in the 2-section ≈ 2*3*density. */
export function makeC1(n: number, density: number, rng: Rng): Hypergraph {
  const nCl = Math.max(n, Math.round((density * n) / 3));
  const clauses: Triple[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (clauses.length < nCl && guard++ < nCl * 40) {
    const t = randomTriple(n, rng);
    const k = keyOf(t);
    if (seen.has(k)) continue;
    seen.add(k);
    clauses.push(t);
  }
  return buildGraph(n, clauses);
}

/** C0 high-density random — permutation-invariant soup. */
export function makeC0(n: number, rng: Rng): Hypergraph {
  return makeC1(n, Math.min(12, n / 4), rng);
}

/** C3 configuration-like bounded incidence: each vertex in ~r clauses. */
export function makeC3(n: number, r: number, rng: Rng): Hypergraph {
  const nCl = Math.round((n * r) / 3);
  return makeC1(n, (3 * nCl) / n, rng);
}

export function sectionAdj(h: Hypergraph): Uint8Array {
  const { n, clauses } = h;
  const adj = new Uint8Array(n * n);
  for (const [a, b, c] of clauses) {
    adj[a * n + b] = 1;
    adj[b * n + a] = 1;
    adj[a * n + c] = 1;
    adj[c * n + a] = 1;
    adj[b * n + c] = 1;
    adj[c * n + b] = 1;
  }
  return adj;
}

function mono(s: Int8Array, t: Triple) {
  return s[t[0]] === s[t[1]] && s[t[1]] === s[t[2]];
}

function deltaE(s: Int8Array, h: Hypergraph, i: number) {
  let d = 0;
  for (const ci of h.incident[i]!) {
    const t = h.clauses[ci]!;
    const before = mono(s, t) ? 1 : 0;
    s[i] = (s[i] ^ 1) as 0 | 1;
    const after = mono(s, t) ? 1 : 0;
    s[i] = (s[i] ^ 1) as 0 | 1;
    d += after - before;
  }
  return d;
}

export function metropolisSweep(s: Int8Array, h: Hypergraph, rng: Rng, beta: number, pin = -1) {
  const n = h.n;
  for (let k = 0; k < n; k++) {
    const i = rng.int(n);
    const u = rng.next();
    if (i === pin) continue;
    const d = deltaE(s, h, i);
    if (d <= 0 || u < Math.exp(-beta * d)) s[i] = (s[i] ^ 1) as 0 | 1;
  }
}

type Decision = { i: number; u: number };

function decisions(n: number, sweeps: number, rng: Rng) {
  const d: Decision[] = [];
  for (let t = 0; t < sweeps * n; t++) d.push({ i: rng.int(n), u: rng.next() });
  return d;
}

function applyDecisions(s: Int8Array, h: Hypergraph, beta: number, pin: number, decs: Decision[]) {
  for (const { i, u } of decs) {
    if (i === pin) continue;
    const d = deltaE(s, h, i);
    if (d <= 0 || u < Math.exp(-beta * d)) s[i] = (s[i] ^ 1) as 0 | 1;
  }
}

function randomState(n: number, rng: Rng) {
  const s = new Int8Array(n);
  for (let i = 0; i < n; i++) s[i] = rng.next() < 0.5 ? 1 : 0;
  return s;
}

/**
 * M_i→j via CRN matched pairs. Sham (same pin, same decisions) is identically 0.
 */
export function influenceMatrix(
  h: Hypergraph,
  rng: Rng,
  opts: { R: number; horizon: number; beta: number; burn: number },
) {
  const { n } = h;
  const m = new Float64Array(n * n);
  const { R, horizon, beta, burn } = opts;
  for (let src = 0; src < n; src++) {
    const acc0 = new Float64Array(n);
    const acc1 = new Float64Array(n);
    for (let r = 0; r < R; r++) {
      const trial = rng.fork();
      const sBurn = randomState(n, trial);
      for (let b = 0; b < burn; b++) metropolisSweep(sBurn, h, trial, beta, -1);
      const decs = decisions(n, horizon, trial);
      const a0 = sBurn.slice();
      a0[src] = 0;
      applyDecisions(a0, h, beta, src, decs);
      const a1 = sBurn.slice();
      a1[src] = 1;
      applyDecisions(a1, h, beta, src, decs);
      for (let j = 0; j < n; j++) {
        acc0[j]! += a0[j]!;
        acc1[j]! += a1[j]!;
      }
    }
    for (let j = 0; j < n; j++) {
      if (j === src) continue;
      m[src * n + j] = Math.abs(acc0[j]! - acc1[j]!) / R;
    }
  }
  return m;
}

export function shamNull(
  h: Hypergraph,
  rng: Rng,
  opts: { R: number; horizon: number; beta: number; burn: number },
) {
  const src = 0;
  const { n } = h;
  const { R, horizon, beta, burn } = opts;
  let maxDev = 0;
  for (let r = 0; r < R; r++) {
    const trial = rng.fork();
    const sBurn = randomState(n, trial);
    for (let b = 0; b < burn; b++) metropolisSweep(sBurn, h, trial, beta, -1);
    const decs = decisions(n, horizon, trial);
    const a = sBurn.slice();
    a[src] = 0;
    applyDecisions(a, h, beta, src, decs);
    const b = sBurn.slice();
    b[src] = 0;
    applyDecisions(b, h, beta, src, decs);
    for (let j = 0; j < n; j++) maxDev = Math.max(maxDev, Math.abs(a[j]! - b[j]!));
  }
  return maxDev;
}

function threshold(m: Float64Array, n: number, theta: number) {
  const adj = new Uint8Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const v = 0.5 * (m[i * n + j]! + m[j * n + i]!);
      if (v >= theta) {
        adj[i * n + j] = 1;
        adj[j * n + i] = 1;
      }
    }
  }
  return adj;
}

function medianOff(m: Float64Array, n: number) {
  const v: number[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) v.push(m[i * n + j]!);
  v.sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)] ?? 0;
}

function giantFrac(adj: Uint8Array, n: number) {
  const seen = new Uint8Array(n);
  let best = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    let size = 0;
    const stack = [s];
    seen[s] = 1;
    while (stack.length) {
      const u = stack.pop()!;
      size++;
      for (let v = 0; v < n; v++) if (adj[u * n + v] && !seen[v]) {
        seen[v] = 1;
        stack.push(v);
      }
    }
    if (size > best) best = size;
  }
  return best / n;
}

function meanDeg(adj: Uint8Array, n: number) {
  let e = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (adj[i * n + j]) e++;
  return (2 * e) / n;
}

function clustering(adj: Uint8Array, n: number) {
  let tri = 0;
  let trip = 0;
  for (let i = 0; i < n; i++) {
    const nb: number[] = [];
    for (let j = 0; j < n; j++) if (adj[i * n + j]) nb.push(j);
    const k = nb.length;
    trip += k * (k - 1);
    for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) if (adj[nb[a]! * n + nb[b]!]!) tri++;
  }
  return trip === 0 ? 0 : (2 * tri) / trip;
}

function volume(adj: Uint8Array, n: number, rMax: number) {
  const acc = new Float64Array(rMax + 1);
  const trials = Math.min(n, 12);
  const step = Math.max(1, Math.floor(n / trials));
  let used = 0;
  for (let s = 0; s < n && used < trials; s += step) {
    used++;
    const dist = new Int16Array(n);
    dist.fill(-1);
    dist[s] = 0;
    const q = [s];
    for (let qi = 0; qi < q.length; qi++) {
      const u = q[qi]!;
      const du = dist[u]!;
      if (du >= rMax) continue;
      for (let v = 0; v < n; v++) {
        if (!adj[u * n + v] || dist[v] >= 0) continue;
        dist[v] = du + 1;
        q.push(v);
      }
    }
    const c = new Float64Array(rMax + 1);
    for (let i = 0; i < n; i++) if (dist[i]! >= 0 && dist[i]! <= rMax) c[dist[i]!]! += 1;
    let run = 0;
    for (let r = 0; r <= rMax; r++) {
      run += c[r]!;
      acc[r]! += run;
    }
  }
  for (let r = 0; r <= rMax; r++) acc[r]! /= Math.max(used, 1);
  return acc;
}

function polyVsExp(vol: Float64Array) {
  const rs: number[] = [];
  const ys: number[] = [];
  const last = vol[vol.length - 1]!;
  for (let r = 1; r < vol.length; r++) {
    const v = vol[r]!;
    if (v > 1.4 && v < 0.8 * last) {
      rs.push(r);
      ys.push(Math.log(v));
    }
  }
  if (rs.length < 3) return { dh: Number.NaN, poly: Number.NaN, exp: Number.NaN, expanderLike: true };
  const logR = rs.map((r) => Math.log(r));
  const slope = (xs: number[], ys: number[]) => {
    const n = xs.length;
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
      sx += xs[i]!;
      sy += ys[i]!;
      sxx += xs[i]! * xs[i]!;
      sxy += xs[i]! * ys[i]!;
    }
    const d = n * sxx - sx * sx;
    return Math.abs(d) < 1e-12 ? Number.NaN : (n * sxy - sx * sy) / d;
  };
  const r2 = (xs: number[], ys: number[]) => {
    const m = slope(xs, ys);
    if (!Number.isFinite(m)) return Number.NaN;
    const xbar = xs.reduce((s, x) => s + x, 0) / xs.length;
    const ybar = ys.reduce((s, y) => s + y, 0) / ys.length;
    const b = ybar - m * xbar;
    let tot = 0, res = 0;
    for (let i = 0; i < xs.length; i++) {
      const pred = m * xs[i]! + b;
      res += (ys[i]! - pred) ** 2;
      tot += (ys[i]! - ybar) ** 2;
    }
    return tot <= 1e-12 ? 1 : 1 - res / tot;
  };
  const dh = slope(logR, ys);
  const poly = r2(logR, ys);
  const exp = r2(rs, ys);
  return { dh, poly, exp, expanderLike: !(poly > exp + 0.04) };
}

function rankRecall(m: Float64Array, adj: Uint8Array, n: number) {
  let hit = 0;
  let tot = 0;
  for (let i = 0; i < n; i++) {
    const nb: number[] = [];
    for (let j = 0; j < n; j++) if (i !== j && adj[i * n + j]) nb.push(j);
    if (!nb.length) continue;
    const ranked = Array.from({ length: n }, (_, j) => j)
      .filter((j) => j !== i)
      .sort((a, b) => m[i * n + b]! - m[i * n + a]!);
    const top = new Set(ranked.slice(0, nb.length));
    for (const j of nb) {
      tot++;
      if (top.has(j)) hit++;
    }
  }
  return tot ? hit / tot : 0;
}

function jaccard(a: Uint8Array, b: Uint8Array) {
  let inter = 0, union = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] || b[i]) union++;
    if (a[i] && b[i]) inter++;
  }
  return union ? inter / union : 0;
}

function triangleHold(m: Float64Array, n: number, rng: Rng, trials = 80) {
  const d = (i: number, j: number) => -Math.log(0.5 * (m[i * n + j]! + m[j * n + i]!) + 1e-6);
  let ok = 0;
  for (let t = 0; t < trials; t++) {
    const i = rng.int(n);
    let j = rng.int(n - 1);
    if (j >= i) j++;
    let k = rng.int(n - 2);
    const lo = Math.min(i, j), hi = Math.max(i, j);
    if (k >= lo) k++;
    if (k >= hi) k++;
    if (d(i, k) <= d(i, j) + d(j, k) + 1e-9) ok++;
  }
  return ok / trials;
}

export type Layer0Report = {
  id: Layer0Id;
  n: number;
  nClauses: number;
  sham: number;
  theta: number;
  giant: number;
  persist: number;
  clustering: number;
  meanDegree: number;
  dh: number;
  r2poly: number;
  r2exp: number;
  expanderLike: boolean;
  triangle: number;
  meanM: number;
  rankRecall: number;
};

export type MeasureOpts = { R: number; horizon: number; beta: number; burn: number; seed: number };

export function measureHypergraph(id: Layer0Id, h: Hypergraph, opts: MeasureOpts): Layer0Report {
  const rng = new Rng(opts.seed);
  const sham = shamNull(h, rng.fork(), { ...opts, R: Math.min(4, opts.R) });
  const m0 = influenceMatrix(h, rng.fork(), opts);
  const m1 = influenceMatrix(h, rng.fork(), opts);
  const n = h.n;
  const theta = Math.max(1e-4, 0.6 * medianOff(m0, n));
  const a0 = threshold(m0, n, theta);
  const a1 = threshold(m1, n, theta);
  const vol = volume(a0, n, Math.min(8, Math.max(3, Math.floor(Math.sqrt(n)))));
  const fit = polyVsExp(vol);
  let meanM = 0;
  for (let i = 0; i < n * n; i++) meanM += m0[i]!;
  meanM /= n * n;
  return {
    id,
    n,
    nClauses: h.clauses.length,
    sham,
    theta,
    giant: giantFrac(a0, n),
    persist: jaccard(a0, a1),
    clustering: clustering(sectionAdj(h), n),
    meanDegree: meanDeg(a0, n),
    dh: fit.dh,
    r2poly: fit.poly,
    r2exp: fit.exp,
    expanderLike: fit.expanderLike,
    triangle: triangleHold(m0, n, rng),
    meanM,
    rankRecall: rankRecall(m0, sectionAdj(h), n),
  };
}

export function sampleMonoRates(h: Hypergraph, rng: Rng, beta: number, samples: number, burn: number) {
  const s = randomState(h.n, rng);
  for (let b = 0; b < burn; b++) metropolisSweep(s, h, rng, beta, -1);
  const acc = new Float64Array(h.clauses.length);
  for (let t = 0; t < samples; t++) {
    metropolisSweep(s, h, rng, beta, -1);
    for (let c = 0; c < h.clauses.length; c++) if (mono(s, h.clauses[c]!)) acc[c]! += 1;
  }
  for (let c = 0; c < acc.length; c++) acc[c]! /= Math.max(samples, 1);
  return acc;
}

/** New candidate: replace the most-monochromatic clause with a uniform random triple. Not S_rel. */
export function frustratedRewire(h: Hypergraph, rng: Rng, beta: number, sweeps: number, samples: number) {
  let cur = h;
  for (let t = 0; t < sweeps; t++) {
    const rates = sampleMonoRates(cur, rng, beta, samples, 2);
    let worst = 0;
    for (let i = 1; i < rates.length; i++) if (rates[i]! > rates[worst]!) worst = i;
    let next: Triple | null = null;
    for (let g = 0; g < 40; g++) {
      const cand = randomTriple(cur.n, rng);
      if (!cur.index.has(keyOf(cand))) {
        next = cand;
        break;
      }
    }
    if (!next) continue;
    const clauses = cur.clauses.slice();
    clauses[worst] = next;
    cur = buildGraph(cur.n, clauses);
  }
  return cur;
}

export const LAYER0_META: Record<Layer0Id, { name: string; role: string; blurb: string }> = {
  P1: { name: "P1 ring", role: "Positive control", blurb: "Triples (i,i+1,i+2). Coords discarded. Must look 1-dimensional." },
  P2: { name: "P2 2D lattice", role: "Positive control", blurb: "Grid triangulation. Coords discarded. Calibration band." },
  P3: { name: "P3 3D lattice", role: "Positive control", blurb: "Axis triples on a 3-grid. Coords discarded. Calibration band." },
  C0: { name: "C0 mean-field", role: "Negative control", blurb: "High-density random. Must stay mean-field; no finite D." },
  C1: { name: "C1 random 3-uniform", role: "Negative control", blurb: "Expander / random hypergraph. Must fail D_finite." },
  C2: { name: "C2 frozen skeleton", role: "Negative control", blurb: "Same as C1, frozen. Must not supply operational persistence for free — unless the instrument is dead on P1–P3." },
  C3: { name: "C3 bounded incidence", role: "Negative control", blurb: "Degree bound alone must not manufacture locality." },
  frustrated_uniform: {
    name: "Frustrated rewire (uniform)",
    role: "Candidate — not S_rel",
    blurb: "Replace the most-monochromatic clause with a uniformly random triple. No triangles, no K4, no 2-hop.",
  },
};

export function makeControl(id: ControlId, n: number, rng: Rng): Hypergraph {
  if (id === "P1") return makeP1(n);
  if (id === "P2") return makeP2(n);
  if (id === "P3") return makeP3(n);
  if (id === "C0") return makeC0(n, rng);
  if (id === "C1") return makeC1(n, 3, rng);
  if (id === "C2") return makeC1(n, 3, rng);
  return makeC3(n, 4, rng);
}

export class NaeSession {
  id: Layer0Id;
  n: number;
  h: Hypergraph;
  m: Float64Array | null = null;
  adj: Uint8Array;
  positions: Float64Array;
  rng: Rng;
  stepCount = 0;
  report: Layer0Report | null = null;

  constructor(id: Layer0Id, n: number, seed: number) {
    this.id = id;
    this.rng = new Rng(seed);
    this.h = id === "frustrated_uniform" ? makeC1(n, 3, this.rng) : makeControl(id as ControlId, n, this.rng);
    this.n = this.h.n;
    this.adj = sectionAdj(this.h);
    this.positions = new Float64Array(this.n * 2);
    for (let i = 0; i < this.n; i++) {
      this.positions[i * 2] = this.rng.next() * 2 - 1;
      this.positions[i * 2 + 1] = this.rng.next() * 2 - 1;
    }
    for (let k = 0; k < 30; k++) this.relax(0.08);
  }

  step(k = 1) {
    if (this.id !== "frustrated_uniform") return;
    this.h = frustratedRewire(this.h, this.rng, 0.8, k, 6);
    this.adj = sectionAdj(this.h);
    this.n = this.h.n;
    this.stepCount += k;
    this.relax(0.05);
  }

  relax(dt: number) {
    const { n, positions: p, adj } = this;
    const fx = new Float64Array(n);
    const fy = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = p[i * 2]! - p[j * 2]!;
        const dy = p[i * 2 + 1]! - p[j * 2 + 1]!;
        const d2 = dx * dx + dy * dy + 0.08;
        const d = Math.sqrt(d2);
        const linked = adj[i * n + j]!;
        const f = linked ? (d - 0.55) * 0.12 : -0.012 / d2;
        const fxv = (dx / d) * f;
        const fyv = (dy / d) * f;
        fx[i]! -= fxv;
        fy[i]! -= fyv;
        fx[j]! += fxv;
        fy[j]! += fyv;
      }
    }
    for (let i = 0; i < n; i++) {
      p[i * 2]! += dt * fx[i]!;
      p[i * 2 + 1]! += dt * fy[i]!;
    }
  }
}

export const LAYER0_OPTS: MeasureOpts = {
  R: 6,
  horizon: 4,
  beta: 0.8,
  burn: 3,
  seed: 7,
};
