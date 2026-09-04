/** Frozen Experiment Zero. Coordinate-free constraint dynamics. A YES does not derive gravity. */

export type EnsembleId =
  | "adaptive_capacity"
  | "mean_field_control"
  | "erdos_renyi_control"
  | "random_regular_control";

export type Params = {
  n: number;
  steps: number;
  samples: number;
  interveneHorizon: number;
  trials: number;
  capacity: number;
  hebb: number;
  decay: number;
  noise: number;
  theta: number;
  persistWindow: number;
  seed: number;
  ablation?: "none" | "no_hebb" | "no_capacity" | "shuffle";
};

export const PROTOCOL: Params = {
  n: 28,
  steps: 40,
  samples: 24,
  interveneHorizon: 3,
  trials: 12,
  capacity: 5,
  hebb: 0.1,
  decay: 0.05,
  noise: 0.01,
  theta: 0.18,
  persistWindow: 1,
  seed: 4,
};

export const ENSEMBLE_META: Record<
  EnsembleId,
  { name: string; role: string; blurb: string; adaptive: boolean }
> = {
  adaptive_capacity: {
    name: "Adaptive capacity + Hebb",
    role: "Candidate update class",
    blurb:
      "Bounded-capacity couplings, Hebbian co-fluctuation, uniform decay. No coordinates. First-run: NO.",
    adaptive: true,
  },
  mean_field_control: {
    name: "Mean-field (C0)",
    role: "All-to-all control",
    blurb: "Uniform permutation-invariant couplings. Frozen. Expected mean-field, not geometry.",
    adaptive: false,
  },
  erdos_renyi_control: {
    name: "Erdős–Rényi (C1)",
    role: "Negative control",
    blurb: "Static random graph of comparable degree. Expected expander / fail non-degeneracy or G4.",
    adaptive: false,
  },
  random_regular_control: {
    name: "Random regular (C1)",
    role: "Negative control",
    blurb: "Static regular skeleton. Persistence fail on a static graph is estimator noise, not dynamics.",
    adaptive: false,
  },
};

export type GateKey =
  | "G1_connected"
  | "G2_probe_invariance"
  | "G3_persistence"
  | "G4_finite_dimensional_growth"
  | "G5_approx_metricity"
  | "G6_nondegeneracy";

export const GATE_DETAIL: Record<GateKey, { id: string; name: string; detail: string }> = {
  G1_connected: {
    id: "G1",
    name: "Connectedness",
    detail: "Influence graph above θ has a giant component ≥ 80% of nodes.",
  },
  G2_probe_invariance: {
    id: "G2",
    name: "Probe invariance",
    detail: "Directed neighborhoods from M are reciprocal; growth does not depend on which node is the probe.",
  },
  G3_persistence: {
    id: "G3",
    name: "Persistence",
    detail: "Jaccard overlap of thresholded neighborhoods at t and t+Δ after burn-in.",
  },
  G4_finite_dimensional_growth: {
    id: "G4",
    name: "Finite-dimensional growth",
    detail: "Ball volume n(r) closer to polynomial than exponential. Do not fit d_s = 4.",
  },
  G5_approx_metricity: {
    id: "G5",
    name: "Approximate metricity",
    detail: "d_ij = −log(M_ij+ε) obeys the triangle inequality on a large fraction of triples.",
  },
  G6_nondegeneracy: {
    id: "G6",
    name: "Non-degeneracy",
    detail: "Mean operational degree in (2, 0.45(N−1)). Not complete, not empty.",
  },
};

export type EnsembleReport = {
  name: string;
  adaptive: boolean;
  giantFraction: number;
  persistJaccard: number;
  growthExponent: number;
  spectralDim: number;
  triangleHold: number;
  meanDegree: number;
  volumeGrowth: number[];
  gates: Record<GateKey, boolean>;
  passZero: boolean;
  passGeometryHint: boolean;
  meanM: number;
  secondProbe?: number;
  expanderLike?: boolean;
  reciprocity?: number;
  hittingProbe?: number;
  qMin?: number;
};

export const FROZEN_FIRST_RUN: Record<
  EnsembleId,
  { G1: boolean; G3: boolean; G4: boolean; G6: boolean; verdict: string }
> = {
  adaptive_capacity: { G1: false, G3: false, G4: false, G6: true, verdict: "NO" },
  mean_field_control: { G1: false, G3: false, G4: false, G6: true, verdict: "NO" },
  erdos_renyi_control: { G1: false, G3: false, G4: true, G6: false, verdict: "NO (expected as control)" },
  random_regular_control: {
    G1: true,
    G3: false,
    G4: true,
    G6: true,
    verdict: "NO; G3 fail is likely estimator noise on a static graph",
  },
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
  normal() {
    const u = Math.max(1e-12, this.next());
    const v = this.next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  permutation(n: number) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = this.int(i + 1);
      const t = a[i]!;
      a[i] = a[j]!;
      a[j] = t;
    }
    return a;
  }
}

function zeros(n: number) {
  return new Float64Array(n * n);
}
function at(mat: Float64Array, n: number, i: number, j: number) {
  return mat[i * n + j]!;
}
function set(mat: Float64Array, n: number, i: number, j: number, v: number) {
  mat[i * n + j] = v;
}

function softmaxRows(w: Float64Array, n: number, cap: number) {
  const out = zeros(n);
  for (let i = 0; i < n; i++) {
    let max = -1e12;
    for (let j = 0; j < n; j++) if (i !== j) max = Math.max(max, at(w, n, i, j));
    let s = 0;
    const e = new Float64Array(n);
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const v = Math.exp((at(w, n, i, j) - max) / 0.35);
      e[j] = v;
      s += v;
    }
    if (s <= 0) continue;
    for (let j = 0; j < n; j++) if (i !== j) set(out, n, i, j, (cap * e[j]!) / s);
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const v = 0.5 * (at(out, n, i, j) + at(out, n, j, i));
      set(out, n, i, j, v);
      set(out, n, j, i, v);
    }
    set(out, n, i, i, 0);
  }
  return out;
}

function initUniform(n: number, cap: number, rng: Rng, jitter = 0.05) {
  const w = zeros(n);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const v = 1 + jitter * rng.normal();
      set(w, n, i, j, v);
      set(w, n, j, i, v);
    }
  }
  return softmaxRows(w, n, cap);
}

function initErdos(n: number, meanDeg: number, strength: number, rng: Rng) {
  const p = Math.min(0.95, meanDeg / Math.max(n - 1, 1));
  const w = zeros(n);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (rng.next() < p) {
        set(w, n, i, j, strength);
        set(w, n, j, i, strength);
      }
    }
  }
  return w;
}

function initRegular(n: number, k0: number, rng: Rng) {
  let k = Math.min(k0, n - 1);
  if (k % 2 === 1 && n % 2 === 1) k -= 1;
  const w = zeros(n);
  const stubs: number[] = [];
  for (let i = 0; i < n; i++) for (let t = 0; t < k; t++) stubs.push(i);
  for (let i = stubs.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    const tmp = stubs[i]!;
    stubs[i] = stubs[j]!;
    stubs[j] = tmp;
  }
  for (let s = 0; s + 1 < stubs.length; s += 2) {
    const a = stubs[s]!;
    const b = stubs[s + 1]!;
    if (a === b) continue;
    set(w, n, a, b, 1);
    set(w, n, b, a, 1);
  }
  return w;
}

function initMeanField(n: number, cap: number) {
  const w = zeros(n);
  const v = cap / (n - 1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) if (i !== j) set(w, n, i, j, v);
  }
  return w;
}

function sampleStates(w: Float64Array, n: number, nSamples: number, rng: Rng, burn = 6) {
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) s[i] = rng.next() < 0.5 ? 1 : 0;
  const traj = new Float64Array(nSamples * n);
  const total = burn + nSamples;
  const beta = 1;
  let t = 0;
  while (t < total) {
    const i = rng.int(n);
    let field = 0;
    for (let j = 0; j < n; j++) field += at(w, n, i, j) * (2 * s[j]! - 1);
    const p1 = 1 / (1 + Math.exp(-2 * beta * field));
    s[i] = rng.next() < p1 ? 1 : 0;
    if (t >= burn) {
      const row = t - burn;
      for (let j = 0; j < n; j++) traj[row * n + j] = s[j]!;
    }
    t++;
  }
  return traj;
}

function updateCouplings(w: Float64Array, n: number, states: Float64Array, samples: number, p: Params, rng: Rng) {
  const corr = zeros(n);
  for (let t = 0; t < samples; t++) {
    for (let i = 0; i < n; i++) {
      const xi = 2 * states[t * n + i]! - 1;
      for (let j = 0; j < n; j++) {
        const xj = 2 * states[t * n + j]! - 1;
        corr[i * n + j]! += xi * xj;
      }
    }
  }
  const den = Math.max(samples, 1);
  const next = zeros(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const c = p.ablation === "no_hebb" ? 0 : Math.max(corr[i * n + j]! / den, 0);
      const hebb = p.ablation === "no_hebb" ? 0 : p.hebb;
      let v = (1 - p.decay) * at(w, n, i, j) + hebb * c + p.noise * rng.normal();
      if (v < 0) v = 0;
      set(next, n, i, j, v);
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const v = 0.5 * (at(next, n, i, j) + at(next, n, j, i));
      set(next, n, i, j, v);
      set(next, n, j, i, v);
    }
  }
  if (p.ablation === "no_capacity") return next;
  let out = softmaxRows(next, n, p.capacity);
  if (p.ablation === "shuffle") out = shufflePartners(out, n, rng);
  return out;
}

function shufflePartners(w: Float64Array, n: number, rng: Rng) {
  const perm = rng.permutation(n);
  const out = zeros(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      set(out, n, i, j, at(w, n, perm[i]!, perm[j]!));
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const v = 0.5 * (at(out, n, i, j) + at(out, n, j, i));
      set(out, n, i, j, v);
      set(out, n, j, i, v);
    }
  }
  return out;
}

function influenceMatrix(w: Float64Array, n: number, p: Params, rng: Rng) {
  const m = zeros(n);
  const horizon = p.interveneHorizon;
  const trials = p.trials;
  for (let i = 0; i < n; i++) {
    const acc0 = new Float64Array(n);
    const acc1 = new Float64Array(n);
    for (const src of [0, 1] as const) {
      const acc = src === 0 ? acc0 : acc1;
      for (let tr = 0; tr < trials; tr++) {
        const s = new Float64Array(n);
        for (let k = 0; k < n; k++) s[k] = rng.next() < 0.5 ? 1 : 0;
        s[i] = src;
        for (let step = 0; step < horizon; step++) {
          const order = rng.permutation(n);
          for (const j of order) {
            if (j === i && step === 0) continue;
            let field = 0;
            for (let k = 0; k < n; k++) field += at(w, n, j, k) * (2 * s[k]! - 1);
            const p1 = 1 / (1 + Math.exp(-2 * field));
            s[j] = rng.next() < p1 ? 1 : 0;
          }
        }
        for (let k = 0; k < n; k++) acc[k]! += s[k]!;
      }
      for (let k = 0; k < n; k++) acc[k]! /= trials;
    }
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      set(m, n, i, j, 0.5 * Math.abs(acc1[j]! - acc0[j]!));
    }
  }
  return m;
}

function thresholdGraph(m: Float64Array, n: number, theta: number) {
  const a = new Uint8Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const v = 0.5 * (at(m, n, i, j) + at(m, n, j, i));
      if (v >= theta) {
        a[i * n + j] = 1;
        a[j * n + i] = 1;
      }
    }
  }
  return a;
}

function giantFraction(adj: Uint8Array, n: number) {
  const seen = new Uint8Array(n);
  let best = 0;
  const stack: number[] = [];
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    seen[s] = 1;
    stack.push(s);
    let size = 0;
    while (stack.length) {
      const u = stack.pop()!;
      size++;
      for (let v = 0; v < n; v++) {
        if (adj[u * n + v] && !seen[v]) {
          seen[v] = 1;
          stack.push(v);
        }
      }
    }
    if (size > best) best = size;
  }
  return n ? best / n : 0;
}

function volumeGrowth(adj: Uint8Array, n: number, maxR = 8) {
  const acc = new Float64Array(maxR + 1);
  for (let src = 0; src < n; src++) {
    const dist = new Int16Array(n);
    dist.fill(-1);
    dist[src] = 0;
    const q = [src];
    let qi = 0;
    while (qi < q.length) {
      const u = q[qi++]!;
      for (let v = 0; v < n; v++) {
        if (adj[u * n + v] && dist[v] < 0) {
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

function fitGrowth(vol: Float64Array) {
  const last = vol[vol.length - 1]!;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let r = 1; r < vol.length; r++) {
    const v = vol[r]!;
    if (v > 1.2 && v < 0.85 * last) {
      xs.push(Math.log(r));
      ys.push(Math.log(Math.max(v, 1e-9)));
    }
  }
  if (xs.length < 2) {
    for (let r = 1; r < vol.length; r++) {
      if (vol[r]! > 1) {
        xs.push(Math.log(r));
        ys.push(Math.log(Math.max(vol[r]!, 1e-9)));
      }
    }
  }
  if (xs.length < 2) return Number.NaN;
  return slope(xs, ys);
}

function slope(xs: number[], ys: number[]) {
  const m = xs.length;
  let sx = 0,
    sy = 0,
    sxx = 0,
    sxy = 0;
  for (let i = 0; i < m; i++) {
    sx += xs[i]!;
    sy += ys[i]!;
    sxx += xs[i]! * xs[i]!;
    sxy += xs[i]! * ys[i]!;
  }
  const den = m * sxx - sx * sx;
  return den === 0 ? Number.NaN : (m * sxy - sx * sy) / den;
}

function spectralDim(adj: Uint8Array, n: number, t = 8) {
  const deg = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let d = 0;
    for (let j = 0; j < n; j++) d += adj[i * n + j]!;
    deg[i] = d;
  }
  let pt = new Float64Array(n * n);
  for (let i = 0; i < n; i++) pt[i * n + i] = 1;
  const trans = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    if (deg[i]! <= 0) continue;
    for (let j = 0; j < n; j++) trans[i * n + j] = adj[i * n + j]! / deg[i]!;
  }
  const rets: number[] = [];
  const ts: number[] = [];
  for (let k = 1; k <= t; k++) {
    const next = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let u = 0; u < n; u++) s += pt[i * n + u]! * trans[u * n + j]!;
        next[i * n + j] = s;
      }
    }
    pt = next;
    let tr = 0;
    for (let i = 0; i < n; i++) tr += pt[i * n + i]!;
    rets.push(tr / n);
    ts.push(k);
  }
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < rets.length; i++) {
    if (rets[i]! > 1e-12) {
      xs.push(Math.log(ts[i]!));
      ys.push(Math.log(rets[i]!));
    }
  }
  if (xs.length < 3) return Number.NaN;
  return -2 * slope(xs, ys);
}

function triangleHold(m: Float64Array, n: number, rng: Rng, samples = 400) {
  let ok = 0;
  let tot = 0;
  for (let s = 0; s < samples; s++) {
    const i = rng.int(n);
    let j = rng.int(n);
    let k = rng.int(n);
    if (i === j || j === k || i === k) continue;
    const dij = -Math.log(0.5 * (at(m, n, i, j) + at(m, n, j, i)) + 1e-4);
    const djk = -Math.log(0.5 * (at(m, n, j, k) + at(m, n, k, j)) + 1e-4);
    const dik = -Math.log(0.5 * (at(m, n, i, k) + at(m, n, k, i)) + 1e-4);
    tot++;
    if (dik <= dij + djk + 1e-9) ok++;
  }
  return tot ? ok / tot : 0;
}

function meanDegree(adj: Uint8Array, n: number) {
  let s = 0;
  for (let i = 0; i < n * n; i++) s += adj[i]!;
  return n ? s / n : 0;
}

function jaccard(a: Uint8Array, b: Uint8Array) {
  let inter = 0;
  let union = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    if (x || y) union++;
    if (x && y) inter++;
  }
  return union === 0 ? 0 : inter / union;
}

function polyVsExp(vol: Float64Array) {
  const rs: number[] = [];
  const ys: number[] = [];
  const last = vol[vol.length - 1]!;
  for (let r = 1; r < vol.length; r++) {
    const v = vol[r]!;
    if (v > 1.2 && v < 0.85 * last) {
      rs.push(r);
      ys.push(Math.log(Math.max(v, 1e-9)));
    }
  }
  if (rs.length < 3) return { poly: Number.NaN, exp: Number.NaN, expanderLike: true };
  const logR = rs.map((r) => Math.log(r));
  const poly = r2(logR, ys);
  const exp = r2(rs, ys);
  return { poly, exp, expanderLike: !(poly > exp + 0.04) };
}

function r2(xs: number[], ys: number[]) {
  const m = slope(xs, ys);
  if (!Number.isFinite(m)) return Number.NaN;
  const xbar = xs.reduce((s, x) => s + x, 0) / xs.length;
  const ybar = ys.reduce((s, y) => s + y, 0) / ys.length;
  const b = ybar - m * xbar;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < xs.length; i++) {
    const pred = m * xs[i]! + b;
    ssRes += (ys[i]! - pred) ** 2;
    ssTot += (ys[i]! - ybar) ** 2;
  }
  return ssTot <= 1e-12 ? 1 : 1 - ssRes / ssTot;
}

function probeStats(m: Float64Array, n: number, theta: number) {
  const recs: number[] = [];
  const vols: number[] = [];
  for (let i = 0; i < n; i++) {
    const out: number[] = [];
    const inn: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      if (m[i * n + j]! >= theta) out.push(j);
      if (m[j * n + i]! >= theta) inn.push(j);
    }
    const a = new Set(out);
    const b = new Set(inn);
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    const uni = a.size + b.size - inter;
    recs.push(uni ? inter / uni : 1);
    vols.push(out.length + 1);
  }
  recs.sort((x, y) => x - y);
  const rec = recs[Math.floor(recs.length / 2)] ?? 0;
  const mean = vols.reduce((s, v) => s + v, 0) / Math.max(vols.length, 1);
  const var_ = vols.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(vols.length, 1);
  const cv = mean > 0 ? Math.sqrt(var_) / mean : 1;
  return { reciprocity: rec, growthCV: cv };
}

function corrFromStates(states: Float64Array, samples: number, n: number) {
  const c = new Float64Array(n * n);
  const mean = new Float64Array(n);
  for (let t = 0; t < samples; t++) {
    for (let i = 0; i < n; i++) mean[i]! += states[t * n + i]!;
  }
  for (let i = 0; i < n; i++) mean[i]! /= Math.max(samples, 1);
  for (let t = 0; t < samples; t++) {
    for (let i = 0; i < n; i++) {
      const xi = states[t * n + i]! - mean[i]!;
      for (let j = 0; j < n; j++) {
        const xj = states[t * n + j]! - mean[j]!;
        c[i * n + j]! += xi * xj;
      }
    }
  }
  const den = Math.max(samples - 1, 1);
  for (let i = 0; i < n * n; i++) c[i]! /= den;
  for (let i = 0; i < n; i++) c[i * n + i] = 0;
  return c;
}

function absJaccard(a: Float64Array, b: Float64Array, n: number, thetaA: number, thetaB: number) {
  let inter = 0;
  let union = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const x = Math.abs(a[i * n + j]!) >= thetaA;
      const y = Math.abs(b[i * n + j]!) >= thetaB;
      if (x || y) union++;
      if (x && y) inter++;
    }
  }
  return union ? inter / union : 0;
}

function medianAbs(mat: Float64Array) {
  const v = Array.from(mat).map((x) => Math.abs(x)).sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)] ?? 0;
}

function evaluate(mHist: Float64Array[], n: number, p: Params, rng: Rng, corr?: Float64Array) {
  const m = mHist[mHist.length - 1]!;
  const adj = thresholdGraph(m, n, p.theta);
  const vol = volumeGrowth(adj, n);
  const growth = fitGrowth(vol);
  const spec = spectralDim(adj, n);
  const fit = polyVsExp(vol);
  let persist = 0;
  if (mHist.length > p.persistWindow) {
    const a = thresholdGraph(mHist[mHist.length - 1]!, n, p.theta);
    const b = thresholdGraph(mHist[mHist.length - 1 - p.persistWindow]!, n, p.theta);
    persist = jaccard(a, b);
  }
  const deg = meanDegree(adj, n);
  const giant = giantFraction(adj, n);
  const tri = triangleHold(m, n, rng);
  const probe = probeStats(m, n, p.theta);
  const vol1 = vol.length > 1 ? vol[1]! : n;
  let second = 0;
  if (corr) {
    second = absJaccard(m, corr, n, p.theta, Math.max(1e-4, 0.5 * medianAbs(corr)));
  }
  const g1 = giant >= 0.8;
  const g2 = probe.reciprocity >= 0.45 && probe.growthCV <= 0.55;
  const g3 = persist >= 0.35;
  const g4 =
    vol1 < 0.55 * n &&
    !Number.isNaN(growth) &&
    growth >= 0.6 &&
    growth <= 4.8 &&
    !fit.expanderLike;
  const g5 = tri >= 0.7;
  const g6 = deg >= 2 && deg <= 0.45 * (p.n - 1);
  const gates: Record<GateKey, boolean> = {
    G1_connected: g1,
    G2_probe_invariance: g2,
    G3_persistence: g3,
    G4_finite_dimensional_growth: g4,
    G5_approx_metricity: g5,
    G6_nondegeneracy: g6,
  };
  return {
    giant,
    persist,
    growth,
    spec,
    tri,
    deg,
    vol: Array.from(vol),
    gates,
    passZero: g1 && g2 && g3 && g6,
    passGeometryHint: g1 && g2 && g3 && g4 && g5 && g6,
    adj,
    m,
    probe,
    secondProbe: second,
    expanderLike: fit.expanderLike,
    r2poly: fit.poly,
    r2exp: fit.exp,
  };
}

function seedW(id: EnsembleId, p: Params, rng: Rng) {
  if (id === "adaptive_capacity") return initUniform(p.n, p.capacity, rng, 0.08);
  if (id === "mean_field_control") return initMeanField(p.n, p.capacity);
  if (id === "erdos_renyi_control") return initErdos(p.n, p.capacity, 1.2, rng);
  return initRegular(p.n, p.capacity % 2 === 0 ? p.capacity : p.capacity - 1, rng);
}

export class ZeroSession {
  params: Params;
  ensemble: EnsembleId;
  n: number;
  w: Float64Array;
  m: Float64Array | null = null;
  adj: Uint8Array;
  stepCount = 0;
  rng: Rng;
  positions: Float64Array;
  report: EnsembleReport | null = null;
  mHist: Float64Array[] = [];

  constructor(ensemble: EnsembleId, params: Params) {
    this.params = { ...params };
    this.ensemble = ensemble;
    this.n = params.n;
    this.rng = new Rng(params.seed);
    this.w = seedW(ensemble, params, this.rng);
    this.adj = thresholdGraph(this.w, this.n, 0.4);
    this.positions = new Float64Array(this.n * 2);
    for (let i = 0; i < this.n; i++) {
      this.positions[i * 2] = this.rng.next() * 2 - 1;
      this.positions[i * 2 + 1] = this.rng.next() * 2 - 1;
    }
    for (let k = 0; k < 40; k++) this.relax(0.08);
  }

  step(count = 1) {
    const { n, params } = this;
    const adaptive = ENSEMBLE_META[this.ensemble].adaptive;
    for (let s = 0; s < count; s++) {
      const states = sampleStates(this.w, n, params.samples, this.rng);
      if (adaptive) this.w = updateCouplings(this.w, n, states, params.samples, params, this.rng);
      this.stepCount++;
    }
    this.relax(0.05);
  }

  measure(): EnsembleReport {
    return this.runFull();
  }

  runFull(): EnsembleReport {
    const { n, params } = this;
    const adaptive = ENSEMBLE_META[this.ensemble].adaptive;
    this.mHist = [];
    this.stepCount = 0;
    this.w = seedW(this.ensemble, params, this.rng);
    const mid = Math.floor(params.steps / 2);
    let lastStates: Float64Array | null = null;
    for (let t = 0; t < params.steps; t++) {
      const states = sampleStates(this.w, n, params.samples, this.rng);
      lastStates = states;
      if (adaptive || params.ablation) this.w = updateCouplings(this.w, n, states, params.samples, params, this.rng);
      this.stepCount++;
      if (t === mid || t === params.steps - 1) {
        this.mHist.push(influenceMatrix(this.w, n, params, this.rng));
      }
    }
    this.m = this.mHist[this.mHist.length - 1] ?? null;
    const corr = lastStates ? corrFromStates(lastStates, params.samples, n) : undefined;
    const ev = evaluate(this.mHist, n, params, this.rng, corr);
    this.adj = ev.adj;
    const hit = this.w ? hittingSim(this.w, n, this.rng) : null;
    let hittingProbe = 0;
    let qMin = 0;
    if (this.m && corr && hit) {
      const thHit = Math.max(1e-4, 0.5 * medianAbs(hit));
      const thC = Math.max(1e-4, 0.5 * medianAbs(corr));
      hittingProbe = absJaccard(this.m, hit, n, params.theta, thHit);
      const qch = absJaccard(corr, hit, n, thC, thHit);
      qMin = Math.min(ev.secondProbe, hittingProbe, qch);
    }
    let meanM = 0;
    if (this.m) {
      for (let i = 0; i < n * n; i++) meanM += this.m[i]!;
      meanM /= n * n;
    }
    this.report = {
      name: this.ensemble,
      adaptive,
      giantFraction: ev.giant,
      persistJaccard: ev.persist,
      growthExponent: ev.growth,
      spectralDim: ev.spec,
      triangleHold: ev.tri,
      meanDegree: ev.deg,
      volumeGrowth: ev.vol,
      gates: ev.gates,
      passZero: ev.passZero,
      passGeometryHint: ev.passGeometryHint,
      meanM,
      secondProbe: ev.secondProbe,
      expanderLike: ev.expanderLike,
      reciprocity: ev.probe.reciprocity,
      hittingProbe,
      qMin,
    };
    for (let k = 0; k < 50; k++) this.relax(0.08);
    return this.report;
  }

  relax(dt: number) {
    const { n, positions: p, adj } = this;
    const fx = new Float64Array(n);
    const fy = new Float64Array(n);
    const w = this.m ?? this.w;
    for (let i = 0; i < n; i++) {
      const xi = p[i * 2]!;
      const yi = p[i * 2 + 1]!;
      fx[i]! -= 0.02 * xi;
      fy[i]! -= 0.02 * yi;
      for (let j = i + 1; j < n; j++) {
        const dx = xi - p[j * 2]!;
        const dy = yi - p[j * 2 + 1]!;
        const d2 = dx * dx + dy * dy + 0.05;
        const inv = 0.04 / d2;
        fx[i]! += dx * inv;
        fy[i]! += dy * inv;
        fx[j]! -= dx * inv;
        fy[j]! -= dy * inv;
        const coup = Math.max(at(w, n, i, j), adj[i * n + j] ? 0.4 : 0);
        if (coup > 0.05) {
          fx[i]! += 0.12 * coup * (p[j * 2]! - xi);
          fy[i]! += 0.12 * coup * (p[j * 2 + 1]! - yi);
          fx[j]! -= 0.12 * coup * (p[j * 2]! - xi);
          fy[j]! -= 0.12 * coup * (p[j * 2 + 1]! - yi);
        }
      }
    }
    for (let i = 0; i < n; i++) {
      p[i * 2] = Math.max(-3, Math.min(3, p[i * 2]! + fx[i]! * dt * 6));
      p[i * 2 + 1] = Math.max(-3, Math.min(3, p[i * 2 + 1]! + fy[i]! * dt * 6));
    }
  }

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
      for (let j = i + 1; j < this.n; j++) if (this.adj[i * this.n + j]) e.push([i, j]);
    }
    return e;
  }

  heatmap() {
    return this.m ?? this.w;
  }
}

export function runProtocol(params: Params = PROTOCOL): EnsembleReport[] {
  const ids: EnsembleId[] = [
    "adaptive_capacity",
    "mean_field_control",
    "erdos_renyi_control",
    "random_regular_control",
  ];
  return ids.map((id) => new ZeroSession(id, { ...params, seed: params.seed }).runFull());
}

export function verdictOf(r: EnsembleReport) {
  if (r.passGeometryHint) return "Geometry hint — Experiment One licensed. Still not gravity.";
  if (r.passZero) return "Locality only — G4/G5 not passed. Do not talk about continuum geometry.";
  return "NO for this update class and this estimator. Not a NO for the research question.";
}

function hittingSim(w: Float64Array, n: number, rng: Rng, cap = 10, trials = 5) {
  const acc = new Float64Array(n * n);
  for (let src = 0; src < n; src++) {
    for (let tr = 0; tr < trials; tr++) {
      const seen = new Int16Array(n);
      seen.fill(-1);
      seen[src] = 0;
      let u = src;
      for (let t = 1; t <= cap; t++) {
        let s = 0;
        for (let j = 0; j < n; j++) if (j !== u) s += at(w, n, u, j);
        if (s <= 0) break;
        let r = rng.next() * s;
        let v = 0;
        for (let j = 0; j < n; j++) {
          if (j === u) continue;
          r -= at(w, n, u, j);
          if (r <= 0) {
            v = j;
            break;
          }
          v = j;
        }
        if (seen[v] < 0) seen[v] = t;
        u = v;
      }
      for (let j = 0; j < n; j++) {
        if (j === src) continue;
        acc[src * n + j]! += seen[j] < 0 ? cap : seen[j]!;
      }
    }
  }
  const sim = zeros(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      set(sim, n, i, j, 1 / (1 + acc[i * n + j]! / trials));
    }
  }
  return sim;
}

export function diagnoseFrozenCoupling(w: Float64Array, p: Params, seed: number) {
  const rng = new Rng(seed ^ 0x9e3779b9);
  const n = p.n;
  const m0 = influenceMatrix(w, n, p, rng);
  const m1 = influenceMatrix(w, n, p, rng);
  return evaluate([m0, m1], n, p, rng);
}

export type AblationKind = "none" | "no_hebb" | "no_capacity" | "shuffle";

export const ABLATION_META: Record<AblationKind, { name: string; expect: string }> = {
  none: { name: "Baseline adaptive", expect: "Candidate. Currently NO." },
  no_hebb: { name: "Ablate joint statistics", expect: "If a phase existed, it should collapse." },
  no_capacity: { name: "Ablate capacity bound", expect: "If capacity was load-bearing, mean-field returns." },
  shuffle: { name: "Shuffle partners each step", expect: "If persistent partners were load-bearing, locality dies." },
};

export function runAblationSuite(p: Params = { ...PROTOCOL, n: 20, steps: 16, trials: 8 }) {
  const kinds: AblationKind[] = ["none", "no_hebb", "no_capacity", "shuffle"];
  return kinds.map((ablation) => {
    const sess = new ZeroSession("adaptive_capacity", {
      ...p,
      ablation: ablation === "none" ? undefined : ablation,
    });
    const r = sess.runFull();
    return {
      ablation,
      name: ABLATION_META[ablation].name,
      passZero: r.passZero,
      g1: r.gates.G1_connected,
      g3: r.gates.G3_persistence,
      g4: r.gates.G4_finite_dimensional_growth,
      g6: r.gates.G6_nondegeneracy,
      expanderLike: r.expanderLike ?? true,
      secondProbe: r.secondProbe ?? 0,
    };
  });
}
