export function TranscriptPanel({
  transcript,
  timestamp,
}: {
  transcript: string;
  timestamp?: string | undefined;
}) {
  return (
    <div className="panel animate-fade-up p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="label-tech text-foreground/70">You</span>
        {timestamp ? <span className="label-tech">{timestamp}</span> : null}
      </div>
      <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
        &ldquo;{transcript}&rdquo;
      </p>
    </div>
  );
}
