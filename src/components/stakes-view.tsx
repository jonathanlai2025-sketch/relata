import { Link } from "@tanstack/react-router";
import { BOXED, CORRECTION, CURRENT, LEVELS } from "@/lib/theory/stakes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StakesView() {
  return (
    <div className="mx-auto min-w-0 max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        What a pass would mean
      </p>
      <h1 className="mt-4 font-display text-[2.1rem] leading-[1.15] tracking-tight sm:text-5xl">
        Locality first. Gravity much later.
      </h1>
      <p className="mt-6 text-[17px] leading-8 text-foreground/90">{BOXED.everyday}</p>

      <aside className="mt-8 rounded-lg border border-destructive/40 bg-card px-4 py-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-destructive">
          {CURRENT.lookFor} is not the current result
        </div>
        <p className="mt-2 font-display text-3xl tracking-tight">LOCALITY_EMERGENCE = FAIL</p>
        <p className="mt-2 text-sm leading-6 text-muted">{CURRENT.meaning}</p>
        <ul className="mt-3 space-y-1.5 text-sm leading-6 text-foreground/90">
          {CURRENT.receipts.map((r) => (
            <li key={r} className="flex gap-3">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-destructive" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </aside>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <blockquote className="rounded-lg border border-border bg-card px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Deeper result</div>
          <p className="mt-2 font-display text-xl leading-snug">{BOXED.deep}</p>
        </blockquote>
        <blockquote className="rounded-lg border border-border bg-card px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Only then</div>
          <p className="mt-2 font-display text-xl leading-snug">{BOXED.gravity}</p>
        </blockquote>
      </div>

      <p className="mt-8 text-[15px] leading-7 text-foreground/90">
        The original sentence — “{CORRECTION.tooHigh}” — {CORRECTION.deeper}
      </p>

      <ol className="mt-10 space-y-4">
        {LEVELS.map((lv) => (
          <li key={lv.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Level {lv.id}
              </div>
              <div className={cn("text-[11px] uppercase tracking-[0.12em]", "text-warn")}>
                Unearned
              </div>
            </div>
            <h2 className="mt-2 font-display text-2xl tracking-tight">{lv.title}</h2>
            <p className="mt-2 text-sm leading-6 text-foreground/90">{lv.body}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{lv.means}</p>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-[15px] leading-7 text-muted">
        If Level 1 comes back genuinely green — surviving controls, ablations, finite-size scaling,
        independent probes, and replication, with receipts that it was not embedded, tuned, or
        measurement-dependent — then this stops being a thought experiment. Then there is a result
        to attack. Gravity remains several levels above that.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/lab">Attack Experiment Zero</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/ledger">Open the ledger</Link>
        </Button>
      </div>
    </div>
  );
}
