export type HarvisState = "idle" | "listening" | "processing" | "speaking";

export const STATE_LABEL: Record<HarvisState, string> = {
  idle: "SYSTEM READY",
  listening: "LISTENING",
  processing: "PROCESSING QUERY",
  speaking: "HARVIS RESPONDING",
};

const DOT: Record<HarvisState, string> = {
  idle: "bg-primary",
  listening: "bg-accent",
  processing: "bg-primary",
  speaking: "bg-primary",
};

const FLOW: HarvisState[] = ["idle", "listening", "processing", "speaking"];

export function StatusIndicator({
  state,
  className = "",
}: {
  state: HarvisState;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${DOT[state]} ${
            state === "idle" ? "opacity-60 animate-breathe" : "animate-harvis-pulse"
          }`}
        />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${DOT[state]}`} />
      </span>
      <span className="label-tech text-foreground/85">{STATE_LABEL[state]}</span>
    </div>
  );
}

/** IDLE → LISTENING → PROCESSING → RESPONDING flow indicator. */
export function StateFlow({ state }: { state: HarvisState }) {
  const activeIndex = FLOW.indexOf(state);
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {FLOW.map((s, i) => {
        const active = i === activeIndex;
        return (
          <span key={s} className="flex items-center gap-2">
            <span
              className={`label-tech rounded-full border px-2.5 py-1 transition-colors ${
                active
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/70 text-muted-foreground/70"
              }`}
            >
              {STATE_LABEL[s].replace("SYSTEM ", "").replace("HARVIS ", "")}
            </span>
            {i < FLOW.length - 1 ? (
              <span className="h-px w-3 bg-border" aria-hidden="true" />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
