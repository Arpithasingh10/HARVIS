import { StudentContext } from "../components/StudentContext";
import type { StudentContextValue } from "../components/Header";

export function ContextSetup({
  onConfirm,
}: {
  onConfirm: (context: StudentContextValue) => void;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="hud-vignette pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex w-full justify-center">
        <StudentContext onConfirm={onConfirm} />
      </div>
    </main>
  );
}
