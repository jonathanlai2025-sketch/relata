import { CIRCULARITY, LEDGER } from "@/lib/theory/ledger";
import { FROZEN_TICKET, LEDGERS, LEVEL_LOCK, PROMOTION, SENTENCE, TICKET_ID } from "@/lib/ticket";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "earned", title: "Earned", items: LEDGER.earned, note: "Definitions and architectural theorems of the spine." },
  { key: "postulates", title: "Postulates", items: LEDGER.postulates, note: "Stated intrinsically, tested, never justified by target dimension." },
  { key: "open", title: "Open", items: LEDGER.open, note: "Named failure points. Gravity lives here." },
  { key: "forbidden", title: "Forbidden primitives", items: LEDGER.forbidden, note: "If it appears in the micro-law, the model is circular." },
] as const;

export function LedgerView() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Claims ledger</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">What is closed, and what is not</h1>
      <p className="mt-4 max-w-2xl font-display text-xl leading-snug">{SENTENCE}</p>
      <p className="mt-4 max-w-2xl text-[17px] leading-8 text-foreground/90">
        Three ledgers. Do not mix them. Ticket {TICKET_ID}:{" "}
        <span className="text-destructive">NO PASS</span>. {PROMOTION}
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {Object.values(LEDGERS).map((L) => (
          <aside key={L.title} className="rounded-lg border border-border bg-card px-4 py-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{L.title}</div>
            <p className="mt-2 text-sm leading-6">{L.body}</p>
          </aside>
        ))}
      </div>

      <ol className="mt-8 grid gap-2 sm:grid-cols-5">
        {LEVEL_LOCK.map((lv) => (
          <li key={lv.id} className="rounded-lg border border-border bg-card px-3 py-3">
            <div className="font-mono text-[11px] text-muted">L{lv.id}</div>
            <div className="mt-1 text-sm">{lv.title}</div>
            <div className={cn("mt-2 text-[11px] uppercase tracking-[0.12em]", lv.state.startsWith("LOCKED") ? "text-muted" : "text-warn")}>
              {lv.state}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-4 py-3 font-medium">Predicate</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {FROZEN_TICKET.predicates.map((p) => (
              <tr key={p.id} className="border-b border-border/70 align-top">
                <td className="px-4 py-3 font-mono text-xs">
                  {p.id} {p.name}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-xs uppercase tracking-[0.12em]",
                    p.value === true ? "text-ok" : p.value === false ? "text-destructive" : "text-warn",
                  )}
                >
                  {p.value === true ? "true" : p.value === false ? "false" : "open"}
                </td>
                <td className="px-4 py-3 text-muted">{p.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 max-w-full overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-4 py-3 font-medium">Expression</th>
              <th className="px-4 py-3 font-medium">Primitive?</th>
              <th className="px-4 py-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {CIRCULARITY.map((row) => (
              <tr key={row.expr} className="border-b border-border/70 align-top">
                <td className="px-4 py-3 font-display italic text-accent-2">{row.expr}</td>
                <td className={cn("px-4 py-3 text-xs uppercase tracking-[0.12em]", row.legal ? "text-ok" : "text-destructive")}>
                  {row.legal ? "Legal" : "Illegal"}
                </td>
                <td className="px-4 py-3 text-muted">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-14 space-y-12">
        {SECTIONS.map((sec) => (
          <section key={sec.key}>
            <h2 className="font-display text-2xl tracking-tight">{sec.title}</h2>
            <p className="mt-1 text-sm text-muted">{sec.note}</p>
            <ul className="mt-5 space-y-4">
              {sec.items.map((item) => (
                <li key={item.id} className="rounded-lg border border-border bg-card px-4 py-4">
                  <div className="text-sm font-medium">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-foreground/85">{item.body}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
