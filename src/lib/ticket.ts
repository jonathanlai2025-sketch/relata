/** LOCALITY-EMERGENCE-01. Conjunction only. Three terminal verdicts. */

import type { EnsembleReport } from "@/lib/experiment-zero";
import { SMUGGLING_AUDIT } from "@/lib/theory/receipts";

export const TICKET_ID = "LOCALITY-EMERGENCE-01";

export const SENTENCE =
  "Level 1 is the prize. It is not in hand. Levels 3–5 are not entitled to comment yet.";

export const PROMOTION = "PASS iff every load-bearing predicate passes.";

export const CONJUNCTION = "PASS = N ∧ C ∧ Q ∧ T ∧ D ∧ M ∧ X ∧ A ∧ S ∧ R";

/**
 * Protocol G1 giant 0.80 is the only numeric gate still used as a screen.
 * Persistence σ, probe-overlap, D_eff drift, and ε remain CALIBRATION-PENDING
 * against P1–P3 and C0–C3. Do not treat 0.35 as frozen.
 */
export const PROTOCOL_THRESHOLDS = {
  giant: 0.8,
  degMin: 2,
  degMaxFrac: 0.45,
} as const;

export const UNCALIBRATED = {
  persist: "CALIBRATION-PENDING",
  qJaccard: "CALIBRATION-PENDING",
  scaleDrift: "CALIBRATION-PENDING",
  epsilon: "CALIBRATION-PENDING",
} as const;

export type TicketVerdict = "PASS" | "FAIL" | "INSTRUMENT_INVALID";

export const LEDGERS = {
  conjecture: {
    title: "CONJECTURE",
    body: "relationship → locality → geometry → perhaps eventually gravity.",
    state: "Unadjudicated",
  },
  experiment: {
    title: "EXPERIMENT",
    body: "Can coordinate-free relational dynamics produce robust operational locality?",
    state: "Runnable in part; estimator thresholds not yet calibrated",
  },
  evidence: {
    title: "EVIDENCE",
    body: "NO PASS. S_rel = −γT + δ Σ k²/N + ε K_4 ⇒ FAIL (mechanism, not instrument). 2-hop proposals fail N. K_4 numbers prior to the double-count fix are retracted.",
    state: "NO PASS",
  },
} as const;

export const LEVEL_LOCK = [
  { id: 1, title: "Operational locality", state: "OPEN / NOT ESTABLISHED" },
  { id: 2, title: "Universality-class hint", state: "LOCKED" },
  { id: 3, title: "Kinematics", state: "LOCKED" },
  { id: 4, title: "Effective physics", state: "LOCKED" },
  { id: 5, title: "Gravitational sector", state: "LOCKED" },
] as const;

export type Predicate = {
  id: string;
  name: string;
  value: boolean | null;
  detail: string;
};

export type TicketResult = {
  id: string;
  verdict: TicketVerdict;
  predicates: Predicate[];
  reasons: string[];
};

function noSmuggling() {
  return !SMUGGLING_AUDIT.some((row) => row.found && row.item !== "2-hop neighborhood proposal pool");
}

export function adjudicate(args: {
  candidate?: EnsembleReport | null;
  controls?: EnsembleReport[];
  ablationsRun?: boolean;
  scalingRun?: boolean;
  replicationRun?: boolean;
  usingTwoHopProposal?: boolean;
  qThresholdFrozen?: boolean;
}): TicketResult {
  const reasons: string[] = [];
  const T0 = PROTOCOL_THRESHOLDS;
  const c = args.candidate;
  const N = !args.usingTwoHopProposal && noSmuggling();
  const C = c ? c.gates.G1_connected : null;
  const Q = args.qThresholdFrozen ? (c?.qMin != null ? c.qMin >= 0 : null) : null;
  const T = null;
  const D = c ? c.gates.G4_finite_dimensional_growth : null;
  const M = null;
  const mf = (args.controls ?? []).find((r) => r.name === "mean_field_control");
  const er = (args.controls ?? []).find((r) => r.name === "erdos_renyi_control");
  const rg = (args.controls ?? []).find((r) => r.name === "random_regular_control");
  const controlSep =
    mf && er && rg
      ? !mf.gates.G6_nondegeneracy && (er.expanderLike || !er.gates.G4_finite_dimensional_growth)
      : null;
  const X = c ? c.gates.G6_nondegeneracy && controlSep === true : controlSep;
  const A = args.ablationsRun ? true : null;
  const S = args.scalingRun ? true : null;
  const R = args.replicationRun ? true : null;

  const predicates: Predicate[] = [
    { id: "N", name: "No smuggling", value: N, detail: "No coordinates, target D, 1/r, planted lattice, or 2-hop proposal in the law." },
    { id: "C", name: "Connected", value: C, detail: `Giant ≥ ${T0.giant} used only as a screen, not a frozen T cutoff.` },
    { id: "Q", name: "Cross-probe", value: Q, detail: "CALIBRATION-PENDING against P1–P3 and C0–C3." },
    { id: "T", name: "Persistent", value: T, detail: "σ CALIBRATION-PENDING. C2 must not supply T for free. Instrument-invalid only if P1–P3 fail T at the same resolution." },
    { id: "D", name: "Finite-dimensional", value: D, detail: "Ball growth vs exponential, and spectral return, independently. Do not force 3 or 4." },
    { id: "M", name: "Approximate metric", value: M, detail: "CALIBRATION-PENDING." },
    { id: "X", name: "Non-degenerate / control separation", value: X, detail: "C0–C3 plus P1–P3. Expander is one adversary, not the set." },
    { id: "A", name: "Ablation", value: A, detail: "Not run → cannot PASS." },
    { id: "S", name: "Scaling", value: S, detail: "Drift bound CALIBRATION-PENDING." },
    { id: "R", name: "Replication", value: R, detail: "Not run → cannot PASS." },
  ];

  if (args.usingTwoHopProposal) {
    reasons.push("2-hop proposal fails N_no-smuggling as written.");
  }
  reasons.push(PROMOTION);
  reasons.push("Q, T, M, S cutoffs are CALIBRATION-PENDING. PASS is forbidden.");
  return { id: TICKET_ID, verdict: "FAIL", predicates, reasons };
}

export const FROZEN_TICKET: TicketResult = {
  id: TICKET_ID,
  verdict: "FAIL",
  predicates: [
    { id: "N", name: "No smuggling", value: true, detail: "Uniform triples. 2-hop kernel fails N as written." },
    { id: "C", name: "Connected", value: false, detail: "S_rel: either shards or a giant that looks like the no-action baseline." },
    { id: "Q", name: "Cross-probe", value: null, detail: "CALIBRATION-PENDING." },
    { id: "T", name: "Persistent", value: null, detail: "σ CALIBRATION-PENDING." },
    { id: "D", name: "Finite-dimensional", value: false, detail: "No point in the S_rel screen is connected, homogeneous, and redundancy-rich." },
    { id: "M", name: "Approximate metric", value: null, detail: "CALIBRATION-PENDING." },
    { id: "X", name: "Non-degenerate / control separation", value: false, detail: "C ∧ X ∧ D not jointly achieved." },
    { id: "A", name: "Ablation", value: null, detail: "No phase to ablate." },
    { id: "S", name: "Scaling", value: null, detail: "CALIBRATION-PENDING." },
    { id: "R", name: "Replication", value: null, detail: "No pass to replicate." },
  ],
  reasons: [
    "NO PASS. S_rel ⇒ FAIL (mechanism). Diagnostics validated; positive controls distinguish lattice from expander. Not INSTRUMENT_INVALID.",
    SENTENCE,
  ],
};
