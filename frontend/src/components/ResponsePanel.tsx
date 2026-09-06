import { Volume2, VolumeX } from "lucide-react";
import { parseAnswer } from "../utils/parseAnswer";

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="label-tech text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-display text-base uppercase tracking-wide text-foreground sm:text-lg">
        {value}
      </p>
    </div>
  );
}

export function ResponsePanel({
  answer,
  intent,
  timestamp,
  speaking,
  onReplay,
  onStop,
}: {
  answer: string;
  intent?: string | undefined;
  timestamp?: string | undefined;
  speaking: boolean;
  onReplay: () => void;
  onStop: () => void;
}) {
  const structured = parseAnswer(answer);

  return (
    <div className="panel animate-fade-up relative overflow-hidden border-primary/35 p-4 sm:p-6">
      <span className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary to-transparent" />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="label-tech text-primary">
            HARVIS RESPONSE
          </span>

          {intent ? (
            <span className="rounded border border-border px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-widest text-muted-foreground">
              {intent.replace(/_/g, " ")}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {timestamp ? (
            <span className="label-tech">{timestamp}</span>
          ) : null}

          <button
            type="button"
            onClick={speaking ? onStop : onReplay}
            aria-label={
              speaking ? "Stop speaking" : "Replay response"
            }
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {speaking ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {structured ? (
        <div className="space-y-4">
          <p className="font-display text-2xl font-bold uppercase tracking-[0.12em] text-foreground text-glow sm:text-3xl">
            {structured.subject}
          </p>

          {structured.timeRange ? (
            <p className="font-mono text-lg text-primary sm:text-xl">
              {structured.timeRange}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 border-t border-border/70 pt-4 sm:grid-cols-2">
            {structured.room ? (
              <Field
                label="Location"
                value={structured.room}
              />
            ) : null}

            {structured.faculty ? (
              <Field
                label="Faculty"
                value={structured.faculty}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <p className="font-display text-xl leading-relaxed text-foreground sm:text-2xl">
          {answer}
        </p>
      )}
    </div>
  );
}