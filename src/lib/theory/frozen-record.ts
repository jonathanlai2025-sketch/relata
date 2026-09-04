export const RECORD_DATE = "2026-09-04";
export const RECORD_SOURCE = "/home/user/workspace/expzero/";

export const CONTROLS = [
  { id: "C0", name: "Mean-field / all-to-all", must: "Stays mean-field; no finite D." },
  { id: "C1", name: "Random k-uniform / random-regular", must: "Expander behavior; fails D_finite." },
  { id: "C2", name: "Frozen skeleton", must: "Does not supply operational persistence for free." },
  { id: "C3", name: "Bounded capacity, no clustering bias", must: "Degree bound alone does not manufacture locality." },
  { id: "P1–P3", name: "Ring, 2D lattice, 3D lattice", must: "Coordinates used only to build clauses, then discarded. Calibration band." },
] as const;

export const SREL_SCREEN = [
  { gamma: 0.0, delta: 25, eps: 0.0, accept: 0.878, giant: 1.0, comps: 1, clustering: 0.082, degCv: 0.28, degMax: 34, T: 3867, K4: 17, isolated: 0 },
  { gamma: 1.0, delta: 25, eps: 0.0, accept: 0.016, giant: 0.863, comps: 136, clustering: 0.529, degCv: 1.8, degMax: 171, T: 50654, K4: 193400, isolated: 134 },
  { gamma: 1.0, delta: 25, eps: 0.5, accept: 0.078, giant: 0.775, comps: 216, clustering: 0.35, degCv: 1.35, degMax: 93, T: 23892, K4: 10052, isolated: 212 },
  { gamma: 1.0, delta: 25, eps: 1.0, accept: 0.226, giant: 0.979, comps: 22, clustering: 0.239, degCv: 0.96, degMax: 82, T: 11706, K4: 1448, isolated: 21 },
  { gamma: 1.0, delta: 25, eps: 2.0, accept: 0.424, giant: 1.0, comps: 1, clustering: 0.123, degCv: 0.45, degMax: 48, T: 5531, K4: 53, isolated: 0 },
] as const;

export const SREL_VERDICT = {
  action: "S_rel = −γT + δ Σ k_i²/N + ε K_4",
  verdict: "FAIL" as const,
  n: 1000,
  density: 3.0,
  sweeps: 170,
  anneal: 85,
  reading:
    "Two regimes, no third. K4 restores a giant by destroying the redundancy that was the candidate signature of locality. ε=2.0 is indistinguishable from the γ=0 baseline. Triangle reward plus degree penalty cannot produce extended geometry.",
  instrument: "FAIL of the mechanism, not INSTRUMENT_INVALID. Positive controls distinguish ring/lattice power-law from random exponential at this resolution.",
};

export const RETRACTIONS = [
  "Any earlier structural number quoting K_4 is retracted. The 4-clique counter double-counted by a factor of 2.",
  "2-hop neighborhood proposals fail N_no-smuggling. Uniform triples are the minimum fix.",
];

export const UNVERIFIED_CLAIMS = [
  "β ≈ 0.7–1.0 optimizes per-hop dynamic range (≈ 3.6× decay per hop). Claim, not receipt.",
  "E1 (first-arrival) sensitivity-limited, pinned near D_H ≈ 0.8–0.9 on a 3D lattice. Re-verify.",
  "E2 (response decay) qualitative verdicts correct, exponents biased-high. Re-verify.",
];

export const SHAM_NULL = {
  value: 0,
  note: "Sham-intervention null is identically 0.000 under common random numbers. Detection floor ≈ 3/R. ε = 6√(0.5/R) was rejected as unjustified.",
};
