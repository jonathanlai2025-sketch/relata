import { useEffect } from "react";
import { GraphCanvas } from "@/components/graph-canvas";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ENSEMBLE_META,
  FROZEN_FIRST_RUN,
  GATE_DETAIL,
  type EnsembleId,
  type GateKey,
} from "@/lib/experiment-zero";
import { REWIRE_META, type RewireId } from "@/lib/rewire";
import { isRewire, labelOf, useLab, type LabEnsemble } from "@/lib/lab-store";
import { cn } from "@/lib/utils";

const ISING: EnsembleId[] = [
  "adaptive_capacity",
  "mean_field_control",
  "erdos_renyi_control",
  "random_regular_control",
];

const REWIRE: RewireId[] = ["overlap_uniform", "overlap_two_hop"];

const GATE_ORDER: GateKey[] = [
  "G1_connected",
  "G2_probe_invariance",
  "G3_persistence",
  "G4_finite_dimensional_growth",
  "G5_approx_metricity",
  "G6_nondegeneracy",
];

export function LabView() {
  const lab = useLab();

  useEffect(() => {
    if (!lab.steps && !lab.report) lab.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lab.running) return;
    let id = 0;
    const loop = () => {
      useLab.getState().tick();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [lab.running]);

  const rewire = isRewire(lab.ensemble);
  const frozen = !rewire ? FROZEN_FIRST_RUN[lab.ensemble as EnsembleId] : null;
  const report = lab.report;
  const comb = report && "combinatorial" in report ? report.combinatorial : null;

  return (
    <div className="mx-auto grid min-w-0 max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6">
      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Frozen protocol
            </div>
            <h1 className="font-display text-3xl tracking-tight">Experiment Zero</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
              The result to look for is LOCALITY_EMERGENCE = PASS, with receipts it was not
              embedded, tuned, or measurement-dependent. A YES does not derive gravity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => lab.init()}>
              Initialize
            </Button>
            <Button variant="secondary" onClick={() => lab.setView(lab.view === "graph" ? "matrix" : "graph")}>
              {lab.view === "graph" ? "Show M" : "Show graph"}
            </Button>
            <Button onClick={() => lab.runZero()} disabled={lab.busy}>
              {lab.busy ? "Measuring…" : "Run this ensemble"}
            </Button>
          </div>
        </div>

        <aside className="mb-4 rounded-lg border border-warn/35 bg-card px-4 py-3 text-sm leading-6">
          <div className="text-[11px] uppercase tracking-[0.14em] text-warn">{lab.ticket.id}</div>
          <p className="mt-1 font-display text-2xl tracking-tight">{lab.ticket.verdict}</p>
          <p className="mt-1">
            {lab.ticket.reasons[0]} Conjunction only. One red predicate blocks promotion. Do not
            optimize toward PASS.
          </p>
        </aside>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-muted">
            <span>
              {labelOf(lab.ensemble)} · t = {lab.steps} · {lab.view === "matrix" ? "matrix" : "2-section / M"}
            </span>
            <span>Observer sketch, not ontology</span>
          </div>
          <div className="h-[min(58vh,520px)] min-h-[280px]">
            <GraphCanvas view={lab.view} running={lab.running} />
          </div>
        </div>

        {comb && (
          <p className="mt-3 text-sm text-muted">
            2-section clustering {comb.clustering.toFixed(3)} · combinatorial D_H{" "}
            {Number.isFinite(comb.hausdorff) ? comb.hausdorff.toFixed(2) : "—"} · mean degree{" "}
            {comb.meanDegree.toFixed(2)}
            {rewire && lab.ensemble === "overlap_two_hop"
              ? " — 2-hop proposal: do not credit the action for this locality."
              : ""}
          </p>
        )}

        {report && (
          <div className="mt-4">
            <p className={cn("mb-3 text-sm", report.passZero ? "text-ok" : "text-destructive")}>
              {report.passGeometryHint
                ? "All six gates pass — Experiment One licensed. Still not gravity."
                : report.passZero
                  ? "Locality only. Continuum hint did not pass."
                  : "NO for this ensemble. Do not talk about geometry or gravity."}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {GATE_ORDER.map((key) => {
                const g = GATE_DETAIL[key];
                const pass = report.gates[key];
                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-lg border bg-card px-4 py-3",
                      pass ? "border-ok/35" : "border-destructive/35",
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-[11px] text-muted">
                        {g.id} {g.name}
                      </span>
                      <span className={cn("text-[11px] uppercase tracking-[0.12em]", pass ? "text-ok" : "text-destructive")}>
                        {pass ? "Pass" : "Fail"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted">{g.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {lab.ablations.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-2 font-medium">Ablation</th>
                  <th className="px-3 py-2 font-medium">G1</th>
                  <th className="px-3 py-2 font-medium">G3</th>
                  <th className="px-3 py-2 font-medium">G4</th>
                  <th className="px-3 py-2 font-medium">Expander</th>
                  <th className="px-3 py-2 font-medium">Zero</th>
                </tr>
              </thead>
              <tbody>
                {lab.ablations.map((r) => (
                  <tr key={r.ablation} className="border-b border-border/70">
                    <td className="px-3 py-2">{r.name}</td>
                    <Cell ok={r.g1} />
                    <Cell ok={r.g3} />
                    <Cell ok={r.g4} />
                    <td className="px-3 py-2 text-xs text-muted">{r.expanderLike ? "yes" : "no"}</td>
                    <td className={cn("px-3 py-2 text-xs uppercase tracking-[0.12em]", r.passZero ? "text-ok" : "text-destructive")}>
                      {r.passZero ? "locality" : "NO"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lab.sweepNotes.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-2 font-medium">Kernel</th>
                  <th className="px-3 py-2 font-medium">γ</th>
                  <th className="px-3 py-2 font-medium">Clustering</th>
                  <th className="px-3 py-2 font-medium">D_H</th>
                  <th className="px-3 py-2 font-medium">Reading</th>
                </tr>
              </thead>
              <tbody>
                {lab.sweepNotes.map((n) => (
                  <tr key={n.label} className="border-b border-border/70">
                    <td className="px-3 py-2">{n.kernel === "two_hop" ? "2-hop (archive)" : "uniform"}</td>
                    <td className="px-3 py-2 font-mono">{n.gamma}</td>
                    <td className="px-3 py-2 font-mono">{n.clustering.toFixed(3)}</td>
                    <td className="px-3 py-2 font-mono">{n.hausdorff.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-muted">{n.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lab.reports.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-2 font-medium">Ensemble</th>
                  <th className="px-3 py-2 font-medium">G1</th>
                  <th className="px-3 py-2 font-medium">G3</th>
                  <th className="px-3 py-2 font-medium">G4</th>
                  <th className="px-3 py-2 font-medium">G6</th>
                  <th className="px-3 py-2 font-medium">Zero</th>
                </tr>
              </thead>
              <tbody>
                {lab.reports.map((r) => (
                  <tr key={r.name} className="border-b border-border/70">
                    <td className="px-3 py-2">{labelOf(r.name)}</td>
                    <Cell ok={r.gates.G1_connected} />
                    <Cell ok={r.gates.G3_persistence} />
                    <Cell ok={r.gates.G4_finite_dimensional_growth} />
                    <Cell ok={r.gates.G6_nondegeneracy} />
                    <td className={cn("px-3 py-2 text-xs uppercase tracking-[0.12em]", r.passZero ? "text-ok" : "text-destructive")}>
                      {r.passZero ? "locality" : "NO"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Ising ensembles</div>
          <div className="mt-3 grid gap-2">
            {ISING.map((id) => (
              <EnsembleButton key={id} id={id} on={lab.ensemble === id} onPick={lab.setEnsemble} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Clause proposal</div>
          <div className="mt-3 grid gap-2">
            {REWIRE.map((id) => (
              <EnsembleButton key={id} id={id} on={lab.ensemble === id} onPick={lab.setEnsemble} />
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">
            {rewire ? REWIRE_META[lab.ensemble as RewireId].blurb : "Uniform vs 2-hop is the contamination test, not a gravity test."}
          </p>
          {frozen && (
            <p className="mt-2 font-mono text-[11px] text-muted">Frozen first-run: {frozen.verdict}</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Protocol knobs</div>
          <Param label="N" value={String(lab.params.n)}>
            <Slider
              min={16}
              max={36}
              step={1}
              value={[lab.params.n]}
              onValueChange={(v) => lab.setParam("n", v[0] ?? 28)}
            />
          </Param>
          <Param label="Threshold θ" value={lab.params.theta.toFixed(2)}>
            <Slider
              min={0.08}
              max={0.4}
              step={0.01}
              value={[lab.params.theta]}
              onValueChange={(v) => lab.setParam("theta", v[0] ?? 0.18)}
            />
          </Param>
          <Param label="Intervention trials" value={String(lab.params.trials)}>
            <Slider
              min={6}
              max={24}
              step={1}
              value={[lab.params.trials]}
              onValueChange={(v) => lab.setParam("trials", v[0] ?? 12)}
            />
          </Param>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <Button className="w-full" onClick={() => lab.runProtocol()} disabled={lab.busy}>
            {lab.busy ? "Running…" : "Run Ising protocol"}
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => lab.runSweep()} disabled={lab.busy}>
            {lab.busy ? "Sweeping…" : "Sweep proposal kernels"}
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => lab.runAblations()} disabled={lab.busy}>
            {lab.busy ? "Ablating…" : "Run ablation suite"}
          </Button>
          <p className="text-xs leading-5 text-muted">
            Level 1 is the prize. It is not in hand. Ablations and 2-hop vs uniform are receipts, not gravity tests.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Protocol log</div>
          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-xs leading-5 text-muted">
            {lab.log.slice(-16).map((line, i) => (
              <li key={`${i}-${line.slice(0, 18)}`}>{line}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function EnsembleButton({
  id,
  on,
  onPick,
}: {
  id: LabEnsemble;
  on: boolean;
  onPick: (id: LabEnsemble) => void;
}) {
  const meta = isRewire(id) ? REWIRE_META[id] : ENSEMBLE_META[id];
  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      className={cn(
        "min-h-11 rounded-md border px-3 py-2.5 text-left transition-colors duration-150",
        on ? "border-accent/50 bg-card-2" : "border-border hover:bg-card-2",
      )}
    >
      <div className="text-sm">{meta.name}</div>
      <div className="text-[11px] text-muted">{meta.role}</div>
    </button>
  );
}

function Param({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-mono tabular-nums">{value}</span>
      </div>
      {children}
    </div>
  );
}

function Cell({ ok }: { ok: boolean }) {
  return (
    <td className={cn("px-3 py-2 text-xs uppercase tracking-[0.12em]", ok ? "text-ok" : "text-destructive")}>
      {ok ? "pass" : "fail"}
    </td>
  );
}
