import { Mic, Square } from "lucide-react";
import type { HarvisState } from "./StatusIndicator";

export function VoiceButton({
  state,
  onStart,
  onStop,
  disabled = false,
}: {
  state: HarvisState;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}) {
  const listening = state === "listening";
  const busy = state === "processing";

  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={listening ? onStop : onStart}
      className={`group inline-flex items-center gap-3 rounded-full border px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.28em] transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
        listening
          ? "border-accent/60 bg-accent/10 text-accent"
          : "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-[0_0_28px_oklch(0.72_0.15_205/25%)]"
      }`}
    >
      {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      {listening ? "Stop" : busy ? "Working" : "Ask HARVIS"}
    </button>
  );
}
