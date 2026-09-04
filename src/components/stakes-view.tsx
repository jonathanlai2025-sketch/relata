import { Link } from "@tanstack/react-router";
import { BOXED, CORRECTION, CURRENT, VALVE } from "@/lib/theory/stakes";
import { LEVEL1_PASS, RECEIPTS, SMUGGLING_AUDIT } from "@/lib/theory/receipts";
import { CONJUNCTION, LEVEL_LOCK, PROMOTION, SENTENCE } from "@/lib/ticket";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  fail: "text-destructive",
  open: "text-warn",
  caught: "text-ok",
  defined: "text-muted",
};

export function StakesView() {
  return (
    <div className="mx-auto min-w-0 max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        What a pass would mean
      </p>
      <p className="mt-3 font-display text-xl leading-snug text-foreground">{SENTENCE}</p>
      <h1 className="mt-4 font-display text-[2.1rem] leading-[1.15] tracking-tight sm:text-5xl">
        Locality first. Gravity much later.
      </h1>
      <p className="mt-6 text-[17px] leading-8 text-foreground/90">{BOXED.everyday}</p>
      <p className="mt-4 text-sm leading-6 text-muted">{VALVE}</p>

      <aside className="mt-8 rounded-lg border border-destructive/40 bg-card px-4 py-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-destructive">
          {LEVEL1_PASS.box} is not the current result
        </div>
        <p className="mt-2 font-display text-3xl tracking-tight">{CURRENT.localityEmergence}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{CURRENT.meaning}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{LEVEL1_PASS.requires}</p>
      </aside>

      <h2 className="mt-12 font-display text-2xl tracking-tight">Receipts before the box can be ticked</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        A pass that cannot be attacked is not a pass. Level 1 needs all of these at once.
      </p>
      <ol className="mt-6 space-y-3">
        {RECEIPTS.map((r) => (
          <li key={r.id} className="rounded-lg border border-border bg-card px-4 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-[11px] text-muted">
                {r.id} {r.title}
              </span>
              <span className={cn("text-[11px] uppercase tracking-[0.12em]", TONE[r.status])}>
                {r.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6">{r.need}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{r.now}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 font-display text-2xl tracking-tight">No-smuggling audit</h2>
      <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
        {SMUGGLING_AUDIT.map((row) => (
          <li key={row.item} className="flex items-baseline justify-between gap-3 px-4 py-3 text-sm">
            <span>{row.item}</span>
            <span className={row.found ? "text-destructive" : "text-ok"}>
              {row.found ? "found — caught" : "not in the law"}
            </span>
          </li>
        ))}
      </ul>

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
        {LEVEL_LOCK.map((lv) => (
          <li key={lv.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Level {lv.id}
              </div>
              <div className={cn("text-[11px] uppercase tracking-[0.12em]", lv.state.startsWith("LOCKED") ? "text-muted" : "text-warn")}>
                {lv.state}
              </div>
            </div>
            <h2 className="mt-2 font-display text-2xl tracking-tight">{lv.title}</h2>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-[15px] leading-7 text-muted">
        {CONJUNCTION}. {PROMOTION} No weighted score. No majority vote. No “promising.” No rescuing
        a failed gate with a beautiful phase diagram. Q and S cutoffs are uncalibrated; inventing
        0.80 would be statistical smuggling.
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
