import { Mic } from "lucide-react";
import type { HarvisState } from "./StatusIndicator";

const BARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/**
 * The HARVIS core — concentric technical rings around a microphone.
 * Visual state changes clearly across idle / listening / processing / speaking.
 */
export function AIOrb({
  state,
  onActivate,
  disabled = false,
}: {
  state: HarvisState;
  onActivate: () => void;
  disabled?: boolean;
}) {
  const listening = state === "listening";
  const processing = state === "processing";
  const speaking = state === "speaking";
  const idle = state === "idle";

  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={disabled}
      aria-label="Activate HARVIS voice input"
      className="group relative grid h-64 w-64 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:cursor-not-allowed sm:h-80 sm:w-80"
    >
      {/* Ambient halo */}
      <span
        className={`pointer-events-none absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${
          listening
            ? "bg-accent/30 opacity-100"
            : speaking
              ? "bg-primary/30 opacity-100 animate-harvis-pulse"
              : processing
                ? "bg-primary/25 opacity-100"
                : "bg-primary/15 opacity-80 animate-breathe group-hover:opacity-100"
        }`}
      />

      {/* Listening pulse rings */}
      {listening ? (
        <>
          <span className="pointer-events-none absolute inset-3 rounded-full border border-accent/50 animate-ring-pulse" />
          <span
            className="pointer-events-none absolute inset-3 rounded-full border border-accent/40 animate-ring-pulse"
            style={{ animationDelay: "0.8s" }}
          />
        </>
      ) : null}

      {/* Outer dashed ring */}
      <span
        className={`pointer-events-none absolute inset-0 rounded-full border border-dashed ${
          listening ? "border-accent/50" : "border-primary/35"
        } animate-spin-slow`}
      />

      {/* Tick ring */}
      <span
        className={`pointer-events-none absolute inset-5 rounded-full ${
          processing ? "animate-sweep" : "animate-spin-reverse"
        }`}
      >
        {BARS.map((i) => (
          <span
            key={i}
            className={`absolute left-1/2 top-0 h-3 w-px origin-bottom ${
              listening ? "bg-accent/70" : "bg-primary/55"
            }`}
            style={{ transform: `rotate(${i * 30}deg) translateY(-0.75rem)`, transformOrigin: "50% 7.5rem" }}
          />
        ))}
      </span>

      {/* Processing scanning arc */}
      {processing ? (
        <span className="pointer-events-none absolute inset-7 rounded-full border-2 border-transparent border-t-primary/80 animate-sweep" />
      ) : null}

      {/* Mid ring */}
      <span
        className={`pointer-events-none absolute inset-9 rounded-full border transition-colors ${
          listening ? "border-accent/60" : "border-primary/45"
        } ${idle ? "animate-breathe" : ""}`}
      />

      {/* Core disc */}
      <span
        className={`relative grid h-32 w-32 place-items-center overflow-hidden rounded-full border sm:h-40 sm:w-40 ${
          listening ? "border-accent/60" : "border-primary/50"
        } bg-[radial-gradient(circle_at_50%_35%,oklch(0.3_0.06_230)_0%,oklch(0.17_0.03_258)_75%)] glow-ring transition-transform duration-300 group-hover:scale-[1.03] ${
          listening ? "animate-harvis-pulse" : speaking ? "animate-breathe" : ""
        }`}
      >
        {/* Scan line */}
        <span className="pointer-events-none absolute inset-0 animate-scan bg-[linear-gradient(to_bottom,transparent,oklch(0.82_0.15_205/25%),transparent)]" />

        {speaking || listening ? (
          <span className="flex h-10 items-end gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                className={`w-1 origin-bottom rounded-full animate-bar ${
                  listening ? "bg-accent" : "bg-primary"
                }`}
                style={{ height: "100%", animationDelay: `${i * 0.09}s` }}
              />
            ))}
          </span>
        ) : (
          <Mic
            className={`h-10 w-10 sm:h-12 sm:w-12 text-primary transition-colors`}
            strokeWidth={1.4}
          />
        )}
      </span>
    </button>
  );
}
