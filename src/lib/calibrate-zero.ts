import {
  LAYER0_META,
  LAYER0_OPTS,
  NaeSession,
  Rng,
  frustratedRewire,
  makeC1,
  makeControl,
  measureHypergraph,
  type ControlId,
  type Layer0Id,
  type Layer0Report,
  type MeasureOpts,
} from "./nae";

const CONTROLS: ControlId[] = ["P1", "P2", "P3", "C0", "C1", "C2", "C3"];

export function runLayer0Calibration(
  n = 27,
  opts: MeasureOpts = { ...LAYER0_OPTS, R: 5, horizon: 3, burn: 2 },
): Layer0Report[] {
  const rng = new Rng(opts.seed);
  return CONTROLS.map((id) => {
    const h = makeControl(id, n, rng.fork());
    return measureHypergraph(id, h, { ...opts, seed: opts.seed + id.charCodeAt(1) });
  });
}

export function runFrustratedCandidate(
  n = 27,
  sweeps = 24,
  opts: MeasureOpts = { ...LAYER0_OPTS, R: 5, horizon: 3, burn: 2 },
): Layer0Report {
  const rng = new Rng(opts.seed ^ 0x51ed);
  let h = makeC1(n, 3, rng);
  h = frustratedRewire(h, rng, opts.beta, sweeps, 8);
  return measureHypergraph("frustrated_uniform", h, opts);
}

export function interpretCalibration(rows: Layer0Report[]) {
  const p = rows.filter((r) => r.id.startsWith("P"));
  const c = rows.filter((r) => r.id.startsWith("C"));
  const notes: string[] = [];
  const shamMax = Math.max(...rows.map((r) => r.sham));
  notes.push(`Sham-intervention max deviation = ${shamMax.toFixed(3)} (CRN should be 0).`);
  const pPoly = p.filter((r) => !r.expanderLike).length;
  const cExp = c.filter((r) => r.expanderLike).length;
  notes.push(`Positive controls with poly>exp: ${pPoly}/${p.length}. Negative expander-like: ${cExp}/${c.length}.`);
  const persistP = p.map((r) => r.persist);
  const persistC = c.map((r) => r.persist);
  notes.push(
    `M rank-recall of 2-section neighbors — P: ${p.map((r) => r.rankRecall.toFixed(2)).join(", ")} C: ${c.map((r) => r.rankRecall.toFixed(2)).join(", ")}.`,
  );
  const separated =
    p.every((r) => !r.expanderLike) && c.filter((r) => r.id !== "C2").every((r) => r.expanderLike);
  if (!separated) {
    notes.push(
      "Instrument does not yet cleanly separate lattice power-law from random exponential at this N/R. Q/T/D cutoffs stay CALIBRATION-PENDING. Do not freeze numbers.",
    );
  } else {
    notes.push(
      "Qualitative D-separation observed. Numeric cutoffs still not frozen — one toy N is not a calibration band.",
    );
  }
  return { notes, separated, shamMax };
}

export function interpretCandidate(cand: Layer0Report, cal: Layer0Report[]) {
  const c1 = cal.find((r) => r.id === "C1");
  const p1 = cal.find((r) => r.id === "P1");
  const notes: string[] = [
    "Candidate is frustrated-clause rewiring with uniform triples. Not S_rel. Not 2-hop.",
  ];
  if (c1 && Math.abs(cand.clustering - c1.clustering) < 0.05 && cand.expanderLike === c1.expanderLike) {
    notes.push("Indistinguishable from C1 random 3-uniform on clustering/expander. FAIL of this family at this N.");
  }
  if (p1 && !cand.expanderLike && cand.persist > p1.persist * 0.5 && cand.giant >= 0.8) {
    notes.push("Looks closer to a geometric control than to C1 — still not a PASS. Needs ablations, scaling, replication.");
  }
  notes.push("PASS remains forbidden: Q/T/S cutoffs unfrozen, A/S/R not run.");
  return notes;
}

export { LAYER0_META, NaeSession };
export type { Layer0Id, Layer0Report };
