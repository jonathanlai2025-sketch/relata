export type ReceiptStatus = "defined" | "open" | "fail" | "caught";

export const VALVE =
  "A higher level cannot rewrite a lower one. Level 5 is not entitled to comment until Level 1 is green.";

export const RECEIPTS = [
  {
    id: "R1",
    title: "No smuggling",
    status: "caught" as ReceiptStatus,
    need: "No coordinates, target dimension, inverse-distance kernel, or planted lattice in RNG, initial state, or update rule.",
    now: "Update law is metric-free. 2-hop clause proposals were caught as kernel contamination. Observer layout is labeled a sketch.",
  },
  {
    id: "R2",
    title: "Intervention, not vibe",
    status: "fail" as ReceiptStatus,
    need: "Neighborhoods from M_i→j, plus an independent probe (correlation, hitting time, or response kernel) agreeing above a pre-registered overlap.",
    now: "M is defined. G2 was a tautology and is now a measurement. G3 failed on a static control: the instrument is not yet good enough to certify neighborhoods.",
  },
  {
    id: "R3",
    title: "Controls fail differently",
    status: "fail" as ReceiptStatus,
    need: "Mean-field stays mean-field. Expander / random-regular do not fake polynomial ball growth. A frozen skeleton does not automatically supply operational persistence.",
    now: "First-run: adaptive did not separate from mean-field. Persistence failed on static graphs. Pattern is not yet a candidate phase.",
  },
  {
    id: "R4",
    title: "Ablations hurt the right things",
    status: "open" as ReceiptStatus,
    need: "Remove capacity, remove joint-statistic update, shuffle partners each step — the phase should collapse. If it survives the load-bearing ablation, the cause was misidentified.",
    now: "Ablation suite is registered. Not a green phase to ablate yet.",
  },
  {
    id: "R5",
    title: "Finite-size scaling",
    status: "open" as ReceiptStatus,
    need: "Phase occupies a parameter region whose area does not shrink to a point as N grows. Ball-growth and spectral D_eff may disagree; both must stabilize rather than drift with N.",
    now: "Not run. N=28 is a toy. Do not talk about a continuum.",
  },
  {
    id: "R6",
    title: "Replication",
    status: "open" as ReceiptStatus,
    need: "Different seed, different implementation, same gates.",
    now: "Python and TypeScript exist. They are not yet an independent replication of a pass, because there is no pass.",
  },
] as const;

export const LEVEL1_PASS = {
  box: "LOCALITY-EMERGENCE-01",
  requires:
    "Conjunction of N, C, Q, T, D, M, X, K, A, S, R. Cross-probe Q is agreement among intervention, correlation, and hitting — not changing which node is i. One red predicate blocks promotion.",
  current: "INSTRUMENT_INVALID",
};

export const SMUGGLING_AUDIT = [
  { item: "Coordinates in the update", legal: false, found: false },
  { item: "Target dimension in the loss", legal: false, found: false },
  { item: "Inverse-distance kernel", legal: false, found: false },
  { item: "Planted lattice in the candidate Ising law", legal: false, found: false },
  { item: "2-hop neighborhood proposal pool", legal: false, found: true },
  { item: "Force-layout as ontology", legal: false, found: false },
];
