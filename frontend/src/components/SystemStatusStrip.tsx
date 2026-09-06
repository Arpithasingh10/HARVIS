/**
 * Only currently implemented Phase 1 systems are listed here.
 * Future phases (LLM, RAG, vectors, agents) are intentionally absent.
 */
export function SystemStatusStrip({
  online,
  voiceInput,
  voiceOutput,
}: {
  online: boolean;
  voiceInput: boolean;
  voiceOutput: boolean;
}) {
  const rows: Array<{ label: string; value: string; ok: boolean }> = [
    { label: "Timetable Engine", value: online ? "ACTIVE" : "OFFLINE", ok: online },
    { label: "Structured Data", value: online ? "CONNECTED" : "UNREACHABLE", ok: online },
    { label: "Voice Input", value: voiceInput ? "READY" : "UNAVAILABLE", ok: voiceInput },
    { label: "Voice Output", value: voiceOutput ? "READY" : "UNAVAILABLE", ok: voiceOutput },
  ];

  return (
    <div className="panel grid grid-cols-1 gap-x-8 gap-y-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3">
          <span className="label-tech text-muted-foreground">{row.label}</span>
          <span
            className={`label-tech inline-flex items-center gap-1.5 ${
              row.ok ? "text-primary" : "text-destructive"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${row.ok ? "bg-primary" : "bg-destructive"}`}
            />
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
