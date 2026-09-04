import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Spine" },
  { to: "/lab", label: "Lab" },
  { to: "/stakes", label: "Stakes" },
  { to: "/ledger", label: "Ledger" },
] as const;

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <polygon
        points="16,6 6,26 26,26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="16" cy="6" r="2.1" fill="currentColor" />
      <circle cx="6" cy="26" r="2.1" fill="currentColor" />
      <circle cx="26" cy="26" r="2.1" fill="currentColor" />
    </svg>
  );
}

export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-foreground">
            <Mark className="size-6 text-accent" />
            <span className="font-display text-lg tracking-tight">RELATA</span>
            <span className="hidden text-xs tracking-wide text-muted sm:inline">
              Relational Engagement Laboratory
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-sm px-3 py-2 text-sm transition-colors duration-150",
                    active ? "bg-card text-foreground" : "text-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <nav className="sticky bottom-0 z-30 border-t border-border bg-background/95 md:hidden">
        <div className="grid grid-cols-4">
          {NAV.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-14 items-center justify-center text-sm",
                  active ? "text-foreground" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
