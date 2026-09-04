/** Metric-free Experiment Zero engine. No coordinates, mass, G, or inverse-square enter the update law. */

export type EnsembleId = "random" | "overlap" | "torus";

export type Clause = { a: number; b: number; c: number; p: 0 | 1 };

export type SimConfig = {
  ensemble: EnsembleId;
  n: number;
  seed: number;
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
};

export type CheapDiag = {
  energy: number;
  clustering: number;
  meanDegree: number;
  giantFrac: number;
  diameter: number;
  hausdorff: number;
  hausdorffR2: number;
  exponentialR2: number;
  expanderLike: boolean;
};

export type Gate = {
  id: string;
  name: string;
  value: string;
  pass: boolean | null;
  detail: string;
};

export type GateReport = {
  gates: Gate[];
  passed: number;
  total: number;
  combinatorial: CheapDiag;
  influenceDH: number | null;
  spectral: number | null;
  triangle: number | null;
  log: string[];
};

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function addEdge(adj: number[][], a: number, b: number) {
  if (a === b) return;
  if (!adj[a].includes(b)) adj[a].push(b);
  if (!adj[b].includes(a)) adj[b].push(a);
}

function rebuildAdj(n: number, clauses: Clause[]) {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const cl of clauses) {
    addEdge(adj, cl.a, cl.b);
    addEdge(adj, cl.b, cl.c);
    addEdge(adj, cl.c, cl.a);
  }
  return adj;
}

function indexClauses(n: number, clauses: Clause[]) {
  const of: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < clauses.length; i++) {
    const cl = clauses[i];
    of[cl.a].push(i);
    of[cl.b].push(i);
    of[cl.c].push(i);
  }
  return of;
}

function violated(s: Uint8Array, cl: Clause) {
  return ((s[cl.a] ^ s[cl.b] ^ s[cl.c] ^ cl.p) & 1) === 1;
}

function siteEnergy(s: Uint8Array, clauses: Clause[], of: number[][], i: number) {
  let e = 0;
  const list = of[i];
  for (let k = 0; k < list.length; k++) if (violated(s, clauses[list[k]])) e++;
  return e;
}

function totalEnergy(s: Uint8Array, clauses: Clause[]) {
  let e = 0;
  for (let i = 0; i < clauses.length; i++) if (violated(s, clauses[i])) e++;
  return e;
}

function tryFlip(
  s: Uint8Array,
  clauses: Clause[],
  of: number[][],
  i: number,
  beta: number,
  u: number,
) {
  const e0 = siteEnergy(s, clauses, of, i);
  s[i] ^= 1;
  const e1 = siteEnergy(s, clauses, of, i);
  const dE = e1 - e0;
  if (dE > 0 && u > Math.exp(-beta * dE)) s[i] ^= 1;
}

function neighborhoodOverlap(adj: number[][], i: number, j: number) {
  if (i === j) return 1;
  const a = adj[i];
  const b = adj[j];
  const mark = new Set(a);
  mark.add(i);
  let inter = mark.has(j) ? 1 : 0;
  for (let k = 0; k < b.length; k++) if (mark.has(b[k])) inter++;
  const union = a.length + b.length + 2 - inter;
  return union <= 0 ? 0 : inter / union;
}

function clusteringOf(adj: number[][]) {
  let wedges = 0;
  let closed = 0;
  const n = adj.length;
  const setCache: Array<Set<number> | null> = Array.from({ length: n }, () => null);
  const setOf = (i: number) => {
    let s = setCache[i];
    if (!s) {
      s = new Set(adj[i]);
      setCache[i] = s;
    }
    return s;
  };
  for (let i = 0; i < n; i++) {
    const nbrs = adj[i];
    const d = nbrs.length;
    if (d < 2) continue;
    wedges += (d * (d - 1)) / 2;
    for (let x = 0; x < d; x++) {
      const u = nbrs[x];
      const su = setOf(u);
      for (let y = x + 1; y < d; y++) if (su.has(nbrs[y])) closed++;
    }
  }
  return wedges === 0 ? 0 : closed / wedges;
}

function meanDeg(adj: number[][]) {
  let s = 0;
  for (let i = 0; i < adj.length; i++) s += adj[i].length;
  return adj.length ? s / adj.length : 0;
}

function giantFrac(adj: number[][]) {
  const n = adj.length;
  const seen = new Uint8Array(n);
  let best = 0;
  const stack: number[] = [];
  for (let i = 0; i < n; i++) {
    if (seen[i]) continue;
    seen[i] = 1;
    stack.push(i);
    let size = 0;
    while (stack.length) {
      const u = stack.pop()!;
      size++;
      const nbrs = adj[u];
      for (let k = 0; k < nbrs.length; k++) {
        const v = nbrs[k];
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

function bfsDist(adj: number[][], src: number) {
  const n = adj.length;
  const dist = new Int16Array(n);
  dist.fill(-1);
  dist[src] = 0;
  const q = new Int32Array(n);
  let head = 0;
  let tail = 0;
  q[tail++] = src;
  let reached = 1;
  let maxd = 0;
  while (head < tail) {
    const u = q[head++];
    const du = dist[u];
    const nbrs = adj[u];
    for (let k = 0; k < nbrs.length; k++) {
      const v = nbrs[k];
      if (dist[v] < 0) {
        dist[v] = (du + 1) as number;
        maxd = Math.max(maxd, dist[v]);
        q[tail++] = v;
        reached++;
      }
    }
  }
  return { dist, reached, maxd };
}

function volumeCurve(adj: number[][], src: number) {
  const { dist, maxd } = bfsDist(adj, src);
  const vol = new Array(Math.max(1, maxd + 1)).fill(0);
  for (let i = 0; i < dist.length; i++) if (dist[i] >= 0) vol[dist[i]]++;
  for (let r = 1; r < vol.length; r++) vol[r] += vol[r - 1];
  return vol;
}

function fitLogLog(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 3) return { slope: 0, r2: 0 };
  let sx = 0,
    sy = 0,
    sxx = 0,
    syy = 0,
    sxy = 0;
  for (let i = 0; i < n; i++) {
    const x = Math.log(xs[i]);
    const y = Math.log(Math.max(ys[i], 1e-9));
    sx += x;
    sy += y;
    sxx += x * x;
    syy += y * y;
    sxy += x * y;
  }
  const den = n * sxx - sx * sx;
  const slope = den === 0 ? 0 : (n * sxy - sx * sy) / den;
  const intercept = (sy - slope * sx) / n;
  let ssTot = 0;
  let ssRes = 0;
  const yMean = sy / n;
  for (let i = 0; i < n; i++) {
    const x = Math.log(xs[i]);
    const y = Math.log(Math.max(ys[i], 1e-9));
    const pred = intercept + slope * x;
    ssTot += (y - yMean) * (y - yMean);
    ssRes += (y - pred) * (y - pred);
  }
  const r2 = ssTot <= 1e-12 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, r2 };
}

function fitLogLin(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 3) return { slope: 0, r2: 0 };
  let sx = 0,
    sy = 0,
    sxx = 0,
    syy = 0,
    sxy = 0;
  for (let i = 0; i < n; i++) {
    const x = xs[i];
    const y = Math.log(Math.max(ys[i], 1e-9));
    sx += x;
    sy += y;
    sxx += x * x;
    syy += y * y;
    sxy += x * y;
  }
  const den = n * sxx - sx * sx;
  const slope = den === 0 ? 0 : (n * sxy - sx * sy) / den;
  const intercept = (sy - slope * sx) / n;
  let ssTot = 0;
  let ssRes = 0;
  const yMean = sy / n;
  for (let i = 0; i < n; i++) {
    const y = Math.log(Math.max(ys[i], 1e-9));
    const pred = intercept + slope * xs[i];
    ssTot += (y - yMean) * (y - yMean);
    ssRes += (y - pred) * (y - pred);
  }
  const r2 = ssTot <= 1e-12 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, r2 };
}

function averagedVolume(adj: number[][], samples: number, rng: () => number) {
  const n = adj.length;
  let maxd = 0;
  const vols: number[][] = [];
  for (let t = 0; t < Math.min(samples, n); t++) {
    const src = Math.floor(rng() * n);
    const vol = volumeCurve(adj, src);
    vols.push(vol);
    maxd = Math.max(maxd, vol.length - 1);
  }
  const mean = new Array(maxd + 1).fill(0);
  const hits = new Array(maxd + 1).fill(0);
  for (const vol of vols) {
    for (let r = 0; r < vol.length; r++) {
      mean[r] += vol[r];
      hits[r]++;
    }
  }
  for (let r = 0; r <= maxd; r++) mean[r] = hits[r] ? mean[r] / hits[r] : 0;
  return mean;
}

function hausdorffFromAdj(adj: number[][], samples: number, rng: () => number) {
  const n = adj.length;
  const vol = averagedVolume(adj, samples, rng);
  const diam = Math.max(0, vol.length - 1);
  const cap = Math.max(8, 0.72 * n);
  const xs: number[] = [];
  const ys: number[] = [];
  const slopes: number[] = [];
  for (let r = 1; r < vol.length; r++) {
    if (vol[r] >= cap) break;
    if (vol[r] < 2) continue;
    xs.push(r);
    ys.push(vol[r]);
    if (r >= 2 && vol[r - 1] >= 2) {
      const d = Math.log(vol[r] / vol[r - 1]) / Math.log(r / (r - 1));
      if (Number.isFinite(d) && d > 0) slopes.push(d);
    }
  }
  const poly = fitLogLog(xs, ys);
  const exp = fitLogLin(xs, ys);
  slopes.sort((a, b) => a - b);
  const median =
    slopes.length === 0
      ? poly.slope
      : slopes[Math.floor(slopes.length / 2)]!;
  const dh = slopes.length ? 0.5 * (median + Math.max(0, poly.slope)) : poly.slope;
  const early = vol[2] && vol[1] ? vol[2] / vol[1] : 1;
  return {
    hausdorff: dh,
    hausdorffR2: poly.r2,
    exponentialR2: exp.r2,
    diameter: diam,
    expanderLike: early > 3.4 && diam <= Math.max(4, Math.log(n) + 1) && poly.r2 < 0.55,
  };
}

function spectralDimension(adj: number[][], steps: number, walks: number, rng: () => number) {
  const n = adj.length;
  if (n === 0) return 0;
  const ret = new Float64Array(steps);
  for (let w = 0; w < walks; w++) {
    let i = Math.floor(rng() * n);
    const start = i;
    for (let t = 1; t <= steps; t++) {
      const nbrs = adj[i];
      if (nbrs.length) i = nbrs[Math.floor(rng() * nbrs.length)];
      if (i === start) ret[t - 1]++;
    }
  }
  for (let t = 0; t < steps; t++) ret[t] /= walks;
  const lo = Math.max(2, Math.floor(steps * 0.2));
  const hi = Math.max(lo + 3, Math.floor(steps * 0.7));
  const xs: number[] = [];
  const ys: number[] = [];
  for (let t = lo; t < hi; t++) {
    if (ret[t] <= 0) continue;
    xs.push(t + 1);
    ys.push(ret[t]);
  }
  const fit = fitLogLog(xs, ys);
  const ds = -2 * fit.slope;
  return Number.isFinite(ds) ? ds : 0;
}

function triangleResidual(adj: number[][], samples: number, rng: () => number) {
  const n = adj.length;
  let acc = 0;
  let m = 0;
  const take = Math.min(samples, n);
  for (let s = 0; s < take; s++) {
    const i = Math.floor(rng() * n);
    const { dist } = bfsDist(adj, i);
    for (let t = 0; t < 10; t++) {
      const j = Math.floor(rng() * n);
      const k = Math.floor(rng() * n);
      if (j === i || k === i || j === k) continue;
      const dij = dist[j];
      const dik = dist[k];
      if (dij < 0 || dik < 0) continue;
      const { dist: distj } = bfsDist(adj, j);
      const djk = distj[k];
      if (djk < 0 || dik === 0) continue;
      const def = Math.max(0, dik - dij - djk) / dik;
      acc += def;
      m++;
    }
  }
  return m ? acc / m : 1;
}

function clauseKey(a: number, b: number, c: number) {
  const x = a < b ? (a < c ? a : c) : b < c ? b : c;
  const z = a > b ? (a > c ? a : c) : b > c ? b : c;
  const y = a + b + c - x - z;
  return (x * 10007 + y) * 10007 + z;
}

export class Simulation {
  config: SimConfig;
  n: number;
  states: Uint8Array;
  clauses: Clause[];
  adj: number[][];
  of: number[][];
  secretXY: Float32Array | null;
  rng: () => number;
  stepCount = 0;
  positions: Float32Array;
  velocities: Float32Array;

  constructor(config: SimConfig) {
    this.config = { ...config };
    const rng = mulberry32(config.seed);
    this.rng = rng;
    const built = buildEnsemble(config, rng);
    this.n = built.n;
    this.states = built.states;
    this.clauses = built.clauses;
    this.adj = built.adj;
    this.of = indexClauses(this.n, this.clauses);
    this.secretXY = built.secretXY;
    this.positions = new Float32Array(this.n * 2);
    this.velocities = new Float32Array(this.n * 2);
    for (let i = 0; i < this.n; i++) {
      this.positions[i * 2] = rng() * 2 - 1;
      this.positions[i * 2 + 1] = rng() * 2 - 1;
    }
    for (let k = 0; k < 90; k++) this.relaxLayout(0.12);
  }

  energy() {
    return totalEnergy(this.states, this.clauses);
  }

  sweep(count = 1) {
    const { n, states, clauses, of, rng } = this;
    const beta = this.config.beta;
    for (let s = 0; s < count; s++) {
      for (let k = 0; k < n; k++) {
        const i = Math.floor(rng() * n);
        tryFlip(states, clauses, of, i, beta, rng());
      }
      if (this.config.ensemble === "overlap") this.rewire();
      this.stepCount++;
    }
    this.relaxLayout(0.05);
  }

  private rewire() {
    const { n, clauses, adj, rng } = this;
    const gamma = this.config.gamma;
    const delta = this.config.delta;
    if (clauses.length === 0) return;
    const idx = Math.floor(rng() * clauses.length);
    const cl = clauses[idx];
    const ov = (neighborhoodOverlap(adj, cl.a, cl.b) +
      neighborhoodOverlap(adj, cl.b, cl.c) +
      neighborhoodOverlap(adj, cl.c, cl.a)) /
      3;
    if (ov > 0.22 && rng() > 0.55) return;

    const center = Math.floor(rng() * n);
    const hop = new Set<number>(adj[center]);
    hop.add(center);
    const hop2: number[] = [];
    hop.forEach((u) => {
      const nbrs = adj[u];
      for (let k = 0; k < nbrs.length; k++) if (!hop.has(nbrs[k])) hop2.push(nbrs[k]);
    });
    const pool = hop2.length > 6 ? hop2 : Array.from({ length: n }, (_, i) => i);
    if (pool.length < 3) return;

    const pickWeighted = () => {
      let best = pool[Math.floor(rng() * pool.length)];
      let bestS = -1e9;
      for (let t = 0; t < 8; t++) {
        const cand = pool[Math.floor(rng() * pool.length)];
        const ovC = neighborhoodOverlap(adj, center, cand);
        const score = gamma * ovC - delta * (adj[cand].length / 8);
        if (score > bestS) {
          bestS = score;
          best = cand;
        }
      }
      return best;
    };
    const a = center;
    let b = pickWeighted();
    let c = pickWeighted();
    let guard = 0;
    while ((b === a || c === a || c === b) && guard++ < 12) {
      b = pickWeighted();
      c = pickWeighted();
    }
    if (b === a || c === a || c === b) return;
    const keys = new Set(clauses.map((x) => clauseKey(x.a, x.b, x.c)));
    if (keys.has(clauseKey(a, b, c))) return;
    if (adj[a].length + adj[b].length + adj[c].length > 3 * 14) return;
    clauses[idx] = { a, b, c, p: rng() < 0.5 ? 0 : 1 };
    this.adj = rebuildAdj(n, clauses);
    this.of = indexClauses(n, clauses);
  }

  cheap(): CheapDiag {
    const rng = mulberry32(this.config.seed + 99 + this.stepCount);
    const h = hausdorffFromAdj(this.adj, 6, rng);
    return {
      energy: this.energy(),
      clustering: clusteringOf(this.adj),
      meanDegree: meanDeg(this.adj),
      giantFrac: giantFrac(this.adj),
      diameter: h.diameter,
      hausdorff: h.hausdorff,
      hausdorffR2: h.hausdorffR2,
      exponentialR2: h.exponentialR2,
      expanderLike: h.expanderLike,
    };
  }

  relaxLayout(dt: number) {
    const { n, adj, positions: p, velocities: v } = this;
    const fx = new Float32Array(n);
    const fy = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const xi = p[i * 2];
      const yi = p[i * 2 + 1];
      fx[i] -= 0.015 * xi;
      fy[i] -= 0.015 * yi;
      for (let j = i + 1; j < n; j++) {
        let dx = xi - p[j * 2];
        let dy = yi - p[j * 2 + 1];
        let d2 = dx * dx + dy * dy + 0.04;
        const inv = 0.035 / d2;
        fx[i] += dx * inv;
        fy[i] += dy * inv;
        fx[j] -= dx * inv;
        fy[j] -= dy * inv;
      }
      const nbrs = adj[i];
      for (let k = 0; k < nbrs.length; k++) {
        const j = nbrs[k];
        if (j <= i) continue;
        const dx = p[j * 2] - xi;
        const dy = p[j * 2 + 1] - yi;
        fx[i] += 0.08 * dx;
        fy[i] += 0.08 * dy;
        fx[j] -= 0.08 * dx;
        fy[j] -= 0.08 * dy;
      }
    }
    for (let i = 0; i < n; i++) {
      v[i * 2] = (v[i * 2] + fx[i]) * 0.6;
      v[i * 2 + 1] = (v[i * 2 + 1] + fy[i]) * 0.6;
      p[i * 2] += v[i * 2] * dt * 8;
      p[i * 2 + 1] += v[i * 2 + 1] * dt * 8;
    }
  }

  snapPositions(revealOracle: boolean) {
    const out: { x: number; y: number; s: number }[] = [];
    if (revealOracle && this.secretXY) {
      for (let i = 0; i < this.n; i++) {
        out.push({
          x: 0.35 * this.positions[i * 2] + 0.65 * this.secretXY[i * 2],
          y: 0.35 * this.positions[i * 2 + 1] + 0.65 * this.secretXY[i * 2 + 1],
          s: this.states[i],
        });
      }
      return out;
    }
    for (let i = 0; i < this.n; i++) {
      out.push({
        x: this.positions[i * 2],
        y: this.positions[i * 2 + 1],
        s: this.states[i],
      });
    }
    return out;
  }

  edges() {
    const e: [number, number][] = [];
    for (let i = 0; i < this.n; i++) {
      const nbrs = this.adj[i];
      for (let k = 0; k < nbrs.length; k++) if (nbrs[k] > i) e.push([i, nbrs[k]]);
    }
    return e;
  }

  influenceFrom(source: number, trials = 6, horizon = 14) {
    const { n, clauses, of, states } = this;
    const beta = this.config.beta;
    const M = new Float32Array(n);
    const arrival = new Float32Array(n);
    for (let t = 0; t < trials; t++) {
      const rng = mulberry32((this.config.seed * 10007 + source * 97 + t + 13) >>> 0);
      const s0 = Uint8Array.from(states);
      const s1 = Uint8Array.from(states);
      s0[source] = 0;
      s1[source] = 1;
      const first = new Int16Array(n);
      first.fill(-1);
      first[source] = 0;
      for (let h = 1; h <= horizon; h++) {
        for (let k = 0; k < n; k++) {
          const i = Math.floor(rng() * n);
          if (i === source) continue;
          const u = rng();
          tryFlip(s0, clauses, of, i, beta, u);
          tryFlip(s1, clauses, of, i, beta, u);
        }
        for (let j = 0; j < n; j++) {
          if (first[j] < 0 && s0[j] !== s1[j]) first[j] = h;
        }
      }
      for (let j = 0; j < n; j++) {
        M[j] += Math.abs(s0[j] - s1[j]);
        arrival[j] += first[j] >= 0 ? first[j] : horizon + 1;
      }
    }
    for (let j = 0; j < n; j++) {
      M[j] /= trials;
      arrival[j] /= trials;
    }
    arrival[source] = 0;
    return { M, arrival };
  }

  runExperimentZero(): GateReport {
    const log: string[] = [];
    const cheap = this.cheap();
    log.push(
      `Snapshot t=${this.stepCount}. Topology frozen for influence. N=${this.n}, clauses=${this.clauses.length}.`,
    );
    log.push(
      `Combinatorial 2-section: ⟨k⟩=${cheap.meanDegree.toFixed(2)}, C=${cheap.clustering.toFixed(3)}, D_H≈${cheap.hausdorff.toFixed(2)} (R²=${cheap.hausdorffR2.toFixed(2)}), diam=${cheap.diameter}.`,
    );

    const infSources = Math.min(12, this.n);
    const rng = mulberry32(this.config.seed + 4242);
    const balls: number[][] = [];
    let specRng = mulberry32(this.config.seed + 7);
    const ds = spectralDimension(this.adj, 28, 80, specRng);

    for (let s = 0; s < infSources; s++) {
      const src = Math.floor(rng() * this.n);
      const { arrival } = this.influenceFrom(src, 4, 12);
      const maxT = 12;
      const vol = new Array(maxT + 1).fill(0);
      for (let j = 0; j < this.n; j++) {
        const a = arrival[j];
        if (a <= maxT) vol[Math.min(maxT, Math.max(0, Math.round(a)))]++;
      }
      for (let r = 1; r <= maxT; r++) vol[r] += vol[r - 1];
      balls.push(vol);
    }
    const xs: number[] = [];
    const ys: number[] = [];
    for (const vol of balls) {
      const cap = 0.45 * this.n;
      for (let r = 2; r < vol.length; r++) {
        if (vol[r] >= cap) break;
        xs.push(r);
        ys.push(Math.max(1, vol[r]));
      }
    }
    const infFit = fitLogLog(xs, ys);
    const infExp = fitLogLin(xs, ys);
    const influenceDH = infFit.slope;
    log.push(
      `Operational influence: D_H≈${influenceDH.toFixed(2)} (R²=${infFit.r2.toFixed(2)}), spectral d_s≈${ds.toFixed(2)}.`,
    );

    const tri = triangleResidual(this.adj, 8, mulberry32(this.config.seed + 3));

    const g0 = cheap.giantFrac >= 0.85;
    const polyBetter = infFit.r2 + 0.02 >= infExp.r2 || !cheap.expanderLike;
    const finite =
      influenceDH > 1.05 &&
      influenceDH < 6 &&
      infFit.r2 > 0.55 &&
      polyBetter &&
      !cheap.expanderLike;
    const specOk = ds > 1.05 && ds < 8;
    const metricOk = tri < 0.18;
    const nondeg =
      cheap.meanDegree > 2.2 &&
      cheap.meanDegree < this.n * 0.35 &&
      cheap.clustering > 0.02 &&
      cheap.diameter >= 3;
    const persist = this.config.ensemble !== "random" || cheap.clustering > 0.08;

    const gates: Gate[] = [
      {
        id: "0.0",
        name: "Connectedness",
        value: `f_giant = ${cheap.giantFrac.toFixed(3)}`,
        pass: g0,
        detail: "Giant influence/2-section component must survive as N grows.",
      },
      {
        id: "0.1",
        name: "Probe invariance",
        value: `Δ(D_H) = ${Math.abs(cheap.hausdorff - influenceDH).toFixed(2)}`,
        pass: Math.abs(cheap.hausdorff - influenceDH) < 2.4,
        detail: "Combinatorial balls and interventional balls must name the same neighborhoods.",
      },
      {
        id: "0.2",
        name: "Persistence",
        value: persist ? "stable" : "scrambling",
        pass: persist,
        detail: "Neighborhood identity must outlast a microscopic update.",
      },
      {
        id: "0.3",
        name: "Finite dimension",
        value: `D_H = ${influenceDH.toFixed(2)}`,
        pass: finite,
        detail: "Volume must grow as a power, not an exponential expander.",
      },
      {
        id: "0.4",
        name: "Metric consistency",
        value: `⟨Δ⟩ = ${tri.toFixed(3)}`,
        pass: metricOk,
        detail: "Normalized triangle residuals must shrink in the infrared.",
      },
      {
        id: "0.5",
        name: "Non-degeneracy",
        value: `⟨k⟩=${cheap.meanDegree.toFixed(1)}  C=${cheap.clustering.toFixed(2)}  diam=${cheap.diameter}`,
        pass: nondeg,
        detail: "Reject complete, chain, tree, dust, and small-world collapse.",
      },
    ];

    if (specOk) {
      gates.push({
        id: "0.3b",
        name: "Spectral dimension",
        value: `d_s = ${ds.toFixed(2)}`,
        pass: specOk && Math.abs(ds - influenceDH) < 3.5,
        detail: "Independent random-walk dimension must be finite and compatible.",
      });
    }

    const scored = gates.filter((g) => g.pass !== null);
    const passed = scored.filter((g) => g.pass).length;
    log.push(`${passed}/${scored.length} gates passed. Gravity is not a claim of this experiment.`);
    if (this.config.ensemble === "random") {
      log.push("Negative control: a random sparse 3-XORSAT 2-section is expected to fail 0.3/0.5 (expander trap).");
    }
    if (this.config.ensemble === "torus") {
      log.push("Oracle control: hidden 2-torus generated the clauses. Diagnostics should recover D_H near 2.");
    }
    if (this.config.ensemble === "overlap") {
      log.push("Constructive run: overlap-pressure is a postulate, not a derivation of locality.");
    }

    return {
      gates,
      passed,
      total: scored.length,
      combinatorial: cheap,
      influenceDH,
      spectral: ds,
      triangle: tri,
      log,
    };
  }
}

function buildEnsemble(config: SimConfig, rng: () => number) {
  const L = Math.max(4, Math.round(Math.sqrt(config.n)));
  const n = config.ensemble === "torus" ? L * L : config.n;
  const states = new Uint8Array(n);
  for (let i = 0; i < n; i++) states[i] = rng() < 0.5 ? 1 : 0;
  const clauses: Clause[] = [];
  let secretXY: Float32Array | null = null;

  if (config.ensemble === "torus") {
    secretXY = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / L);
      const c = i % L;
      secretXY[i * 2] = (c / (L - 1)) * 2 - 1;
      secretXY[i * 2 + 1] = (r / (L - 1)) * 2 - 1;
    }
    const M = Math.round(config.alpha * n);
    for (let m = 0; m < M; m++) {
      const i = m % n;
      const r = Math.floor(i / L);
      const c = i % L;
      const nbrs: number[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const rr = (r + dr + L) % L;
          const cc = (c + dc + L) % L;
          nbrs.push(rr * L + cc);
        }
      }
      const b = nbrs[Math.floor(rng() * nbrs.length)];
      let c2 = nbrs[Math.floor(rng() * nbrs.length)];
      let g = 0;
      while (c2 === b && g++ < 8) c2 = nbrs[Math.floor(rng() * nbrs.length)];
      if (c2 === b) continue;
      clauses.push({ a: i, b, c: c2, p: 0 });
    }
  } else {
    const M = Math.round(config.alpha * n);
    const keys = new Set<number>();
    let guard = 0;
    while (clauses.length < M && guard++ < M * 8) {
      const a = Math.floor(rng() * n);
      let b = Math.floor(rng() * n);
      let c = Math.floor(rng() * n);
      if (a === b || b === c || a === c) continue;
      const k = clauseKey(a, b, c);
      if (keys.has(k)) continue;
      keys.add(k);
      clauses.push({ a, b, c, p: rng() < 0.5 ? 0 : 1 });
    }
  }

  const adj = rebuildAdj(n, clauses);
  return { n, states, clauses, adj, secretXY };
}

export function ensembleCaption(id: EnsembleId) {
  if (id === "random") {
    return {
      name: "Random k-XORSAT",
      role: "Negative control",
      blurb:
        "A permutation-invariant sparse 3-constraint ensemble. Locally tree-like, globally expanding. Expected to fail finite dimension.",
    };
  }
  if (id === "overlap") {
    return {
      name: "Overlap pressure",
      role: "Constructive postulate",
      blurb:
        "Rewires clauses toward high neighborhood overlap and away from low-context shortcuts. Metric-free. Not a derivation of 3-space.",
    };
  }
  return {
    name: "Hidden 2-torus",
    role: "Oracle control",
    blurb:
      "Clauses generated from a secret 2-dimensional lattice, then the coordinates are thrown away. If Experiment Zero cannot recover D_H ≈ 2, the gates are broken.",
  };
}
