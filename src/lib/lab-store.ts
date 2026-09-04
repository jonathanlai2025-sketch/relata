import { create } from "zustand";
import {
  ENSEMBLE_META,
  PROTOCOL,
  ZeroSession,
  runAblationSuite,
  runInstrumentCalibration,
  type EnsembleId,
  type EnsembleReport,
  type Params,
  verdictOf,
} from "@/lib/experiment-zero";
import {
  REWIRE_META,
  RewireSession,
  runProposalSweep,
  summarizeSweep,
  type RewireId,
  type RewireReport,
  type SweepRow,
} from "@/lib/rewire";
import { FROZEN_TICKET, adjudicate, type TicketResult } from "@/lib/ticket";

export type LabEnsemble = EnsembleId | RewireId;

export function isRewire(id: string): id is RewireId {
  return id === "overlap_uniform" || id === "overlap_two_hop";
}

export function labelOf(id: string) {
  if (isRewire(id)) return REWIRE_META[id].name;
  return ENSEMBLE_META[id as EnsembleId]?.name ?? id;
}

type LabState = {
  ensemble: LabEnsemble;
  params: Params;
  view: "graph" | "matrix";
  running: boolean;
  steps: number;
  report: EnsembleReport | RewireReport | null;
  reports: EnsembleReport[];
  sweep: SweepRow[];
  sweepNotes: ReturnType<typeof summarizeSweep>;
  ablations: ReturnType<typeof runAblationSuite>;
  calibration: ReturnType<typeof runInstrumentCalibration>;
  ticket: TicketResult;
  busy: boolean;
  log: string[];
  init: () => void;
  setEnsemble: (id: LabEnsemble) => void;
  setParam: (k: keyof Params, v: number) => void;
  toggleRun: () => void;
  step: (k?: number) => void;
  tick: () => void;
  runZero: () => void;
  runProtocol: () => void;
  runSweep: () => void;
  runAblations: () => void;
  runCalibration: () => void;
  setView: (v: "graph" | "matrix") => void;
};

type AnySession = ZeroSession | RewireSession;
let session: AnySession | null = null;

export function getSession() {
  return session;
}

function makeSession(id: LabEnsemble, params: Params): AnySession {
  if (isRewire(id)) return new RewireSession(id, params);
  return new ZeroSession(id, params);
}

export const useLab = create<LabState>((set, get) => ({
  ensemble: "adaptive_capacity",
  params: { ...PROTOCOL },
  view: "graph",
  running: false,
  steps: 0,
  report: null,
  reports: [],
  sweep: [],
  sweepNotes: [],
  ablations: [],
  calibration: [],
  ticket: FROZEN_TICKET,
  busy: false,
  log: [
    "Frozen protocol loaded. First-run result: no ensemble passed Experiment Zero.",
    "Proposal kernel: uniform triples are honest. 2-hop pools insert locality.",
  ],
  init: () => {
    const s = get();
    session = makeSession(s.ensemble, s.params);
    set({
      running: false,
      steps: 0,
      report: null,
      log: [
        `Initialized ${labelOf(s.ensemble)}. N=${s.params.n}, θ=${s.params.theta}.`,
        isRewire(s.ensemble)
          ? "Rewiring: candidate triples from the stated kernel. Action cannot be credited if the proposal is 2-hop."
          : "Neighborhoods are reconstructed from interventional M, not from a declared skeleton.",
      ],
    });
  },
  setEnsemble: (id) => {
    set({ ensemble: id });
    get().init();
  },
  setParam: (k, v) => set({ params: { ...get().params, [k]: v } }),
  toggleRun: () => set({ running: !get().running }),
  step: (k = 1) => {
    if (!session) get().init();
    if (!session) return;
    session.step(k);
    set({ steps: session.stepCount, report: null });
  },
  tick: () => {
    if (!get().running) return;
    get().step(1);
  },
  runZero: () => {
    if (!session) get().init();
    if (!session) return;
    set({ busy: true, running: false });
    const report = session.runFull();
    const extra =
      "combinatorial" in report && report.combinatorial
        ? `  2-section clustering=${(report as RewireReport).combinatorial.clustering.toFixed(3)}  D_H=${(report as RewireReport).combinatorial.hausdorff.toFixed(2)}`
        : "";
    set({
      busy: false,
      steps: session.stepCount,
      report,
      log: [
        ...get().log,
        `${labelOf(report.name)}: pass_zero=${report.passZero}.${extra}`,
        verdictOf(report),
      ],
    });
  },
  runProtocol: () => {
    set({ busy: true, running: false });
    const ids: EnsembleId[] = [
      "adaptive_capacity",
      "mean_field_control",
      "erdos_renyi_control",
      "random_regular_control",
    ];
    const reports: EnsembleReport[] = [];
    const lines: string[] = ["Full protocol. Four ensembles. Gates pre-registered."];
    let keep: AnySession | null = null;
    for (const id of ids) {
      const sess = new ZeroSession(id, get().params);
      const r = sess.runFull();
      reports.push(r);
      if (id === get().ensemble) keep = sess;
      lines.push(
        `${ENSEMBLE_META[id].name}: G1=${r.gates.G1_connected} G3=${r.gates.G3_persistence} G4=${r.gates.G4_finite_dimensional_growth} G6=${r.gates.G6_nondegeneracy} → ${r.passZero ? "locality" : "NO"}`,
      );
    }
    if (keep) session = keep;
    lines.push("Do not narrate adaptive Hebb as emergent nearness unless it beats the controls.");
    const candidate = reports.find((r) => r.name === "adaptive_capacity") ?? null;
    const ticket = adjudicate({
      candidate,
      controls: reports,
      ablationsRun: get().ablations.length > 0,
      scalingRun: false,
      replicationRun: false,
      usingTwoHopProposal: false,
      qThresholdFrozen: false,
    });
    lines.push(`${ticket.id} verdict: ${ticket.verdict}. ${ticket.reasons[0] ?? ""}`);
    set({
      busy: false,
      reports,
      report: reports.find((r) => r.name === get().ensemble) ?? null,
      ticket,
      log: [...get().log, ...lines],
    });
  },
  runSweep: () => {
    set({ busy: true, running: false });
    const rows = runProposalSweep({ ...get().params, n: Math.min(24, get().params.n), steps: 20, trials: 8 });
    const notes = summarizeSweep(rows);
    const lines = ["Proposal-kernel sweep. Uniform vs 2-hop. γ=0 is the contamination test."];
    for (const n of notes) {
      lines.push(
        `${n.kernel} γ=${n.gamma}: clustering=${n.clustering.toFixed(3)}  D_H=${n.hausdorff.toFixed(2)} — ${n.note}`,
      );
    }
    set({
      busy: false,
      sweep: rows,
      sweepNotes: notes,
      log: [...get().log, ...lines],
    });
  },
  runAblations: () => {
    set({ busy: true, running: false });
    const rows = runAblationSuite({ ...get().params, n: Math.min(20, get().params.n), steps: 16, trials: 8 });
    const lines = ["Ablation suite. If a phase existed, killing the load-bearing piece should collapse it."];
    for (const r of rows) {
      lines.push(
        `${r.name}: G1=${r.g1} G3=${r.g3} G4=${r.g4} G6=${r.g6} expander=${r.expanderLike} → ${r.passZero ? "locality" : "NO"}`,
      );
    }
    lines.push("There is no green phase to protect. Ablations are registered for when there is.");
    set({ busy: false, ablations: rows, log: [...get().log, ...lines] });
  },
  runCalibration: () => {
    set({ busy: true, running: false });
    const rows = runInstrumentCalibration({ ...get().params, n: Math.min(20, get().params.n), trials: 10 });
    const lines = [
      "Instrument calibration on known controls only. Candidate not inspected.",
      "A naive M threshold is not expected to separate cycle from random-regular. Do not freeze Q from wishful numbers.",
    ];
    for (const r of rows) {
      lines.push(
        `${r.name} (${r.role}): persist=${r.persist.toFixed(3)} giant=${r.giant.toFixed(3)} D_H=${Number.isFinite(r.growth) ? r.growth.toFixed(2) : "na"} expander=${r.expanderLike}`,
      );
    }
    set({ busy: false, calibration: rows, log: [...get().log, ...lines] });
  },
  setView: (v) => set({ view: v }),
}));
