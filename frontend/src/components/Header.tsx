import { StatusIndicator, type HarvisState } from "./StatusIndicator";

export type StudentContextValue = {
  year: number;
  yearLabel: string;
  branchId: number;
  branchName: string;
  sectionId: number;
  sectionName: string;
};

function sectionLabel(name: string): string {
  return /^section/i.test(name.trim()) ? name : `Section ${name}`;
}

export function Header({
  context,
  state,
  online,
  onReset,
}: {
  context: StudentContextValue;
  state: HarvisState;
  online: boolean;
  onReset: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-primary/40 bg-surface">
            <span className="font-mono text-sm font-bold text-primary text-glow">H</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold tracking-[0.28em] text-foreground text-glow">
              HARVIS
            </h1>
            <p className="label-tech">HITAM AI Virtual Smart Assistant</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 label-tech ${
              online
                ? "border-primary/40 text-primary"
                : "border-destructive/50 text-destructive"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${online ? "bg-primary" : "bg-destructive"}`}
            />
            {online ? "System Online" : "Link Lost"}
          </span>

          <span className="max-w-full rounded-full border border-border bg-surface/70 px-3 py-1.5 label-tech text-center text-foreground/80 sm:max-w-[32rem]">
            {context.yearLabel} • {context.branchName} • {sectionLabel(context.sectionName)}
          </span>

          <StatusIndicator state={state} className="hidden sm:inline-flex" />

          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-border px-3 py-1.5 label-tech transition-colors hover:border-primary/50 hover:text-primary"
          >
            Change
          </button>
        </div>
      </div>
    </header>
  );
}
