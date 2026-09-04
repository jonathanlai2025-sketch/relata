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
    detail: "Neighborhoods are reconstructed from M. No coordinate chart is used.",
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
      const c = Math.max(corr[i * n + j]! / den, 0);
      let v = (1 - p.decay) * at(w, n, i, j) + p.hebb * c + p.noise * rng.normal();
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
  return softmaxRows(next, n, p.capacity);
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

function evaluate(mHist: Float64Array[], n: number, p: Params, rng: Rng) {
  const m = mHist[mHist.length - 1]!;
  const adj = thresholdGraph(m, n, p.theta);
  const vol = volumeGrowth(adj, n);
  const growth = fitGrowth(vol);
  const spec = spectralDim(adj, n);
  let persist = 0;
  if (mHist.length > p.persistWindow) {
    const a = thresholdGraph(mHist[mHist.length - 1]!, n, p.theta);
    const b = thresholdGraph(mHist[mHist.length - 1 - p.persistWindow]!, n, p.theta);
    persist = jaccard(a, b);
  }
  const deg = meanDegree(adj, n);
  const giant = giantFraction(adj, n);
  const tri = triangleHold(m, n, rng);
  const vol1 = vol.length > 1 ? vol[1]! : n;
  const g1 = giant >= 0.8;
  const g2 = true;
  const g3 = persist >= 0.35;
  const g4 = vol1 < 0.55 * n && !Number.isNaN(growth) && growth >= 0.6 && growth <= 4.8;
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
    for (let t = 0; t < params.steps; t++) {
      const states = sampleStates(this.w, n, params.samples, this.rng);
      if (adaptive) this.w = updateCouplings(this.w, n, states, params.samples, params, this.rng);
      this.stepCount++;
      if (t === mid || t === params.steps - 1) {
        this.mHist.push(influenceMatrix(this.w, n, params, this.rng));
      }
    }
    this.m = this.mHist[this.mHist.length - 1] ?? null;
    const ev = evaluate(this.mHist, n, params, this.rng);
    this.adj = ev.adj;
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

export function diagnoseFrozenCoupling(w: Float64Array, p: Params, seed: number) {
  const rng = new Rng(seed ^ 0x9e3779b9);
  const n = p.n;
  const m0 = influenceMatrix(w, n, p, rng);
  const m1 = influenceMatrix(w, n, p, rng);
  return evaluate([m0, m1], n, p, rng);
}
