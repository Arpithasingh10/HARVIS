export type Interaction = {
  id: number;
  question: string;
  answer: string;
  intent?: string | undefined;
  at: string;
};

export function InteractionHistory({ items }: { items: Interaction[] }) {
  return (
    <section className="panel p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="label-tech text-primary">Interaction Log</span>
        <span className="label-tech text-muted-foreground">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Your recent questions to HARVIS will appear here.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((item) => (
            <li key={item.id} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <span className="label-tech text-muted-foreground">{item.at}</span>
              <div>
                <p className="text-sm text-foreground/85">&ldquo;{item.question}&rdquo;</p>
                <p className="mt-1 text-sm text-primary/90">{item.answer}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
