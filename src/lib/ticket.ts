/** LOCALITY-EMERGENCE-01. Conjunction only. Three terminal verdicts. */

import type { EnsembleReport } from "@/lib/experiment-zero";
import { SMUGGLING_AUDIT } from "@/lib/theory/receipts";

export const TICKET_ID = "LOCALITY-EMERGENCE-01";

export const SENTENCE =
  "Level 1 is the prize. It is not in hand. Levels 3–5 are not entitled to comment yet.";

export const THRESHOLDS = {
  giant: 0.8,
  persist: 0.35,
  reciprocity: 0.45,
  growthCV: 0.55,
  qJaccard: 0.4,
  triangle: 0.7,
  dhMin: 0.6,
  dhMax: 4.8,
  polyMargin: 0.04,
  vol1Frac: 0.55,
  degMin: 2,
  degMaxFrac: 0.45,
  scaleNFactor: 4,
  scaleDrift: 0.5,
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
    body: "Currently INSTRUMENT_INVALID. Static random-regular failed persistence, so the instrument could not adjudicate the hypothesis. Those failures stay on the record. Later successes do not reinterpret them.",
  },
} as const;

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
}): TicketResult {
  const reasons: string[] = [];
  const staticCtl = (args.controls ?? []).filter(
    (r) => r.name === "random_regular_control" || r.name === "erdos_renyi_control",
  );
  const instrumentDead = staticCtl.some((r) => r.persistJaccard < THRESHOLDS.persist);
  if (instrumentDead) {
    reasons.push(
      "Static control failed T (persistence). Raise trials until frozen graphs persist. Do not record FAIL against the hypothesis.",
    );
  }

  const c = args.candidate;
  const N = !args.usingTwoHopProposal && noSmuggling();
  const C = c ? c.gates.G1_connected : null;
  const Q = c && c.qMin != null ? c.qMin >= THRESHOLDS.qJaccard && (c.reciprocity ?? 0) >= THRESHOLDS.reciprocity : null;
  const T = c ? c.gates.G3_persistence : null;
  const D = c ? c.gates.G4_finite_dimensional_growth && !c.expanderLike : null;
  const M = c ? c.gates.G5_approx_metricity : null;
  const X = c ? c.gates.G6_nondegeneracy : null;

  const mf = (args.controls ?? []).find((r) => r.name === "mean_field_control");
  const er = (args.controls ?? []).find((r) => r.name === "erdos_renyi_control");
  const rg = (args.controls ?? []).find((r) => r.name === "random_regular_control");
  const K =
    mf && er && rg
      ? !mf.gates.G6_nondegeneracy && (er.expanderLike || !er.gates.G4_finite_dimensional_growth)
      : null;

  const A = args.ablationsRun ? true : null;
  const S = args.scalingRun ? true : null;
  const R = args.replicationRun ? true : null;

  const predicates: Predicate[] = [
    { id: "N", name: "No smuggling", value: N, detail: "Metric-free update. 2-hop is a contaminated kernel, not this ticket’s law." },
    { id: "C", name: "Connected", value: C, detail: `Giant ≥ ${THRESHOLDS.giant}` },
    { id: "Q", name: "Cross-probe", value: Q, detail: `Jaccard(M, corr, hitting) ≥ ${THRESHOLDS.qJaccard}. Changing i is not enough.` },
    { id: "T", name: "Persistent", value: T, detail: `Jaccard mid vs end ≥ ${THRESHOLDS.persist}` },
    { id: "D", name: "Finite-dimensional", value: D, detail: "Polynomial volume beats exponential. Not a fitted d_s=4." },
    { id: "M", name: "Approximate metric", value: M, detail: `Triangle hold ≥ ${THRESHOLDS.triangle}` },
    { id: "X", name: "Non-degenerate", value: X, detail: "Degree in (2, 0.45(N−1))" },
    { id: "K", name: "Controls fail differently", value: K, detail: "Mean-field, expander, and frozen skeleton are separate adversaries." },
    { id: "A", name: "Ablation", value: A, detail: "Not run → cannot PASS." },
    { id: "S", name: "Scaling", value: S, detail: "Not run → cannot PASS." },
    { id: "R", name: "Replication", value: R, detail: "Not run → cannot PASS." },
  ];

  if (instrumentDead) {
    return { id: TICKET_ID, verdict: "INSTRUMENT_INVALID", predicates, reasons };
  }

  const load = predicates.filter((p) => p.id !== "A" && p.id !== "S" && p.id !== "R");
  const missing = predicates.some((p) => p.value !== true);
  if (missing) {
    reasons.push("Conjunction incomplete or false. One red predicate blocks promotion.");
    if (A !== true || S !== true || R !== true) {
      reasons.push("A, S, and R were not in this ticket. PASS is forbidden.");
    }
    return { id: TICKET_ID, verdict: "FAIL", predicates, reasons };
  }

  if (load.some((p) => p.value !== true)) {
    reasons.push("Load-bearing predicate red.");
    return { id: TICKET_ID, verdict: "FAIL", predicates, reasons };
  }

  reasons.push("Conjunction true. Still not gravity.");
  return { id: TICKET_ID, verdict: "PASS", predicates, reasons };
}

export const FROZEN_TICKET: TicketResult = {
  id: TICKET_ID,
  verdict: "INSTRUMENT_INVALID",
  predicates: [
    { id: "N", name: "No smuggling", value: true, detail: "Ising law is metric-free. 2-hop caught separately." },
    { id: "C", name: "Connected", value: false, detail: "First-run adaptive giant failed." },
    { id: "Q", name: "Cross-probe", value: null, detail: "Not certified. Instrument invalid." },
    { id: "T", name: "Persistent", value: false, detail: "Failed on static random-regular. Instrument gate." },
    { id: "D", name: "Finite-dimensional", value: false, detail: "Not reached." },
    { id: "M", name: "Approximate metric", value: null, detail: "Not certified under a valid instrument." },
    { id: "X", name: "Non-degenerate", value: true, detail: "Adaptive G6 passed first-run; not a phase." },
    { id: "K", name: "Controls fail differently", value: null, detail: "Cannot read K until T is valid on static graphs." },
    { id: "A", name: "Ablation", value: null, detail: "Registered. No phase to ablate." },
    { id: "S", name: "Scaling", value: null, detail: "Not run." },
    { id: "R", name: "Replication", value: null, detail: "No pass to replicate." },
  ],
  reasons: [
    "Static random-regular failed persistence. INSTRUMENT_INVALID.",
    SENTENCE,
  ],
};
