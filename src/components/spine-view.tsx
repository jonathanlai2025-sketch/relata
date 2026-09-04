import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LAYERS, HYPOTHESIS, LADDER, type Layer } from "@/lib/theory/spine";
import { CURRENT } from "@/lib/theory/stakes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS: Record<Layer["status"], string> = {
  defined: "Defined",
  postulate: "Postulate",
  measured: "Measured",
  unearned: "Unearned",
};

function Blocks({ layer }: { layer: Layer }) {
  return (
    <div className="space-y-5">
      {layer.blocks.map((b, i) => {
        if (b.type === "p") {
          return (
            <p key={i} className="text-[15px] leading-7 text-foreground/90">
              {b.text}
            </p>
          );
        }
        if (b.type === "eq") {
          return (
            <div key={i} className="eq-block text-[15px] sm:text-base">
              {b.math}
            </div>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="space-y-2 pl-0 text-[15px] leading-6 text-foreground/90">
              {b.items.map((it) => (
                <li key={it} className="flex gap-3">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === "callout") {
          const tone =
            b.kind === "warning"
              ? "border-destructive/40"
              : b.kind === "open"
                ? "border-warn/40"
                : b.kind === "earned"
                  ? "border-ok/40"
                  : "border-border";
          return (
            <aside key={i} className={cn("rounded-lg border bg-card px-4 py-3", tone)}>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                {b.title}
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/90">{b.body}</p>
            </aside>
          );
        }
        return (
          <div key={i} className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted">
                  {b.headers.map((h) => (
                    <th key={h} className="py-2 pr-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/60 align-top">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2.5 pr-4 leading-6">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export function SpineView() {
  const [id, setId] = useState(LAYERS[0].id);
  const layer = LAYERS.find((l) => l.id === id) ?? LAYERS[0];

  return (
    <div className="mx-auto grid max-w-7xl min-w-0 gap-0 lg:grid-cols-[240px_1fr]">
      <aside className="min-w-0 border-b border-border px-4 py-6 lg:border-b-0 lg:border-r lg:px-6">
        <div className="mb-5 hidden lg:block">
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted">Theory spine</div>
          <p className="mt-2 font-display text-xl leading-snug">Bedrock, then upward.</p>
        </div>
        <ol className="flex w-full min-w-0 flex-wrap gap-1 lg:spine-rail lg:flex-col lg:gap-0">
          {LAYERS.map((l) => {
            const active = l.id === id;
            return (
              <li key={l.id} className="lg:pl-7">
                <button
                  type="button"
                  onClick={() => setId(l.id)}
                  className={cn(
                    "relative flex min-h-11 w-full flex-col items-start rounded-sm px-3 py-2.5 text-left transition-colors duration-150 lg:px-2",
                    active ? "bg-card" : "hover:bg-card/60",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-3.5 left-[-18px] hidden size-2.5 rounded-full border lg:block",
                      active ? "border-accent bg-accent" : "border-muted bg-background",
                    )}
                  />
                  <span className="font-mono text-[10px] text-muted">L{l.index}</span>
                  <span className="text-sm">{l.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {HYPOTHESIS.inversion}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-[2.1rem] leading-[1.15] tracking-tight sm:text-5xl">
          {HYPOTHESIS.title}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] leading-8 text-foreground/90">
          {HYPOTHESIS.boxed}
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">{HYPOTHESIS.companion}</p>
        <aside className="mt-6 max-w-2xl rounded-lg border border-destructive/40 bg-card px-4 py-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">
            Present status
          </div>
          <p className="mt-1 font-display text-2xl tracking-tight">LOCALITY_EMERGENCE = FAIL</p>
          <p className="mt-1 text-sm leading-6 text-muted">{CURRENT.meaning}</p>
        </aside>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/lab">Open Experiment Zero</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/stakes">Read the stakes</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-muted">
          {LADDER.map((step, i) => (
            <span key={step} className="flex items-center gap-3">
              {i > 0 && <span className="text-border">→</span>}
              {step}
            </span>
          ))}
        </div>

        <article className="mt-12 max-w-3xl border-t border-border pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] text-muted">
                Layer {layer.index} · {layer.kicker}
              </div>
              <h2 className="mt-1 font-display text-3xl tracking-tight">{layer.title}</h2>
            </div>
            <span
              className={cn(
                "rounded-sm border px-2 py-1 text-[11px] uppercase tracking-[0.14em]",
                layer.status === "unearned"
                  ? "border-warn/40 text-warn"
                  : layer.status === "measured"
                    ? "border-ok/40 text-ok"
                    : "border-border text-muted",
              )}
            >
              {STATUS[layer.status]}
            </span>
          </div>
          <p className="mt-4 font-display text-lg italic leading-8 text-accent-2">{layer.claim}</p>
          <div className="mt-8">
            <Blocks layer={layer} />
          </div>
        </article>
      </main>
    </div>
  );
}
