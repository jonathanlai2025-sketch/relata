/** LOCALITY-EMERGENCE-01. Conjunction only. Three terminal verdicts. */

import type { EnsembleReport } from "@/lib/experiment-zero";
import { SMUGGLING_AUDIT } from "@/lib/theory/receipts";

export const TICKET_ID = "LOCALITY-EMERGENCE-01";

export const SENTENCE =
  "Level 1 is the prize. It is not in hand. Levels 3–5 are not entitled to comment yet.";

export const PROMOTION = "PASS iff every load-bearing predicate passes.";

export const CONJUNCTION = "PASS = N ∧ C ∧ Q ∧ T ∧ D ∧ M ∧ X ∧ A ∧ S ∧ R";

/** Frozen with Experiment Zero, before looking. Not invented to close this ticket. */
export const PROTOCOL_THRESHOLDS = {
  giant: 0.8,
  persist: 0.35,
  triangle: 0.7,
  dhMin: 0.6,
  dhMax: 4.8,
  vol1Frac: 0.55,
  degMin: 2,
  degMaxFrac: 0.45,
} as const;

/**
 * Not frozen. The corpus does not empirically justify overlap or drift cutoffs.
 * Calibrate on known positive and negative controls, then freeze, then look at the candidate.
 * Choosing attractive numbers now is statistical smuggling.
 */
export const UNCALIBRATED = {
  qJaccard: "uncalibrated",
  scaleDrift: "uncalibrated",
  polyMargin: "uncalibrated",
} as const;

export type TicketVerdict = "PASS" | "FAIL" | "INSTRUMENT_INVALID";

export const LEDGERS = {
  conjecture: {
    title: "CONJECTURE",
    body: "relationship → locality → geometry → perhaps eventually gravity.",
  },
  experiment: {
    title: "EXPERIMENT",
    body: "Can coordinate-free relational dynamics produce robust operational locality?",
  },
  evidence: {
    title: "EVIDENCE",
    body: "NO PASS. Failed candidate mechanisms remain FAIL. Runs whose instrumentation failed a positive control remain INSTRUMENT_INVALID, not evidence against the conjecture.",
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
  const staticCtl = (args.controls ?? []).filter(
    (r) => r.name === "random_regular_control" || r.name === "erdos_renyi_control",
  );
  const instrumentDead = staticCtl.some((r) => r.persistJaccard < T0.persist);
  if (instrumentDead) {
    reasons.push(
      "Static control failed T. INSTRUMENT_INVALID — not FAIL of the conjecture. Raise trials until frozen graphs persist.",
    );
  }

  const c = args.candidate;
  const N = !args.usingTwoHopProposal && noSmuggling();
  const C = c ? c.gates.G1_connected : null;
  const Q = args.qThresholdFrozen ? (c?.qMin != null ? c.qMin >= 0 : null) : null;
  const T = c ? c.gates.G3_persistence : null;
  const D = c ? c.gates.G4_finite_dimensional_growth : null;
  const M = c ? c.gates.G5_approx_metricity : null;
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
    { id: "N", name: "No smuggling", value: N, detail: "No coordinates, target D, 1/r kernel, planted lattice, or 2-hop proposal in the law." },
    { id: "C", name: "Connected", value: C, detail: `Giant ≥ ${T0.giant} (protocol-frozen)` },
    { id: "Q", name: "Cross-probe", value: Q, detail: "Intervention M, correlation, and hitting must agree. Threshold uncalibrated — do not invent 0.80." },
    { id: "T", name: "Persistent", value: T, detail: `Jaccard mid vs end ≥ ${T0.persist} (protocol-frozen)` },
    { id: "D", name: "Finite-dimensional", value: D, detail: "Ball growth and spectral return, independently. Do not force 3 or 4." },
    { id: "M", name: "Approximate metric", value: M, detail: `Triangle hold ≥ ${T0.triangle} (protocol-frozen)` },
    { id: "X", name: "Non-degenerate / control separation", value: X, detail: "Mean-field, expander/random-regular, frozen skeleton, and null dynamics fail for the expected reason." },
    { id: "A", name: "Ablation", value: A, detail: "Load-bearing cuts must collapse a claimed phase. Not run → cannot PASS." },
    { id: "S", name: "Scaling", value: S, detail: "Drift bound uncalibrated. Not run → cannot PASS." },
    { id: "R", name: "Replication", value: R, detail: "Independent implementation. Not run → cannot PASS." },
  ];

  if (instrumentDead) {
    return { id: TICKET_ID, verdict: "INSTRUMENT_INVALID", predicates, reasons };
  }

  if (predicates.some((p) => p.value !== true)) {
    reasons.push(PROMOTION);
    reasons.push("Q and S cutoffs are uncalibrated. PASS is forbidden until they are frozen against controls, not chosen to look good.");
    return { id: TICKET_ID, verdict: "FAIL", predicates, reasons };
  }

  reasons.push("Conjunction true. Still not gravity. Levels 2–5 remain LOCKED until separately earned.");
  return { id: TICKET_ID, verdict: "PASS", predicates, reasons };
}

export const FROZEN_TICKET: TicketResult = {
  id: TICKET_ID,
  verdict: "INSTRUMENT_INVALID",
  predicates: [
    { id: "N", name: "No smuggling", value: true, detail: "Ising law is metric-free. 2-hop caught separately." },
    { id: "C", name: "Connected", value: false, detail: "First-run adaptive giant failed. Mechanism FAIL." },
    { id: "Q", name: "Cross-probe", value: null, detail: "Uncalibrated. A naive M threshold does not separate cycle from random-regular." },
    { id: "T", name: "Persistent", value: false, detail: "Failed on static random-regular. INSTRUMENT_INVALID." },
    { id: "D", name: "Finite-dimensional", value: false, detail: "Not reached under a valid instrument." },
    { id: "M", name: "Approximate metric", value: null, detail: "Not certified." },
    { id: "X", name: "Non-degenerate / control separation", value: null, detail: "Cannot read X until T is valid on static graphs." },
    { id: "A", name: "Ablation", value: null, detail: "Registered. No phase to ablate." },
    { id: "S", name: "Scaling", value: null, detail: "Uncalibrated and not run." },
    { id: "R", name: "Replication", value: null, detail: "No pass to replicate." },
  ],
  reasons: [
    "NO PASS. First-run: INSTRUMENT_INVALID (static T failed). Adaptive mechanism: FAIL (did not separate from mean-field).",
    SENTENCE,
  ],
};
