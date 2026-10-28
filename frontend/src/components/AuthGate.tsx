import { useState, type FormEvent } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import {
  friendlyFirebaseError,
  isCollegeEmail,
  signInWithCollegeEmail,
  signUpWithCollegeEmail,
} from "../services/studentProfile";

export function AuthGate() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isCollegeEmail(email)) {
      setError("Use your HITAM college email ending in @hitam.org.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        await signUpWithCollegeEmail(email, password);
      } else {
        await signInWithCollegeEmail(email, password);
      }
    } catch (cause) {
      setError(friendlyFirebaseError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="hud-vignette pointer-events-none absolute inset-0" />
      <section className="panel relative z-10 w-full max-w-md p-6 sm:p-8">
        <div className="mb-8 text-center">
          <p className="label-tech mb-3">HITAM • Student Access</p>
          <h1 className="font-display text-4xl font-bold tracking-[0.25em] text-foreground text-glow">
            HARVIS
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {mode === "signup" ? "Create your student account" : "Sign in to continue"}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-md border border-border p-1">
          {(["signin", "signup"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setMode(tab);
                setError(null);
              }}
              className={`rounded px-3 py-2 label-tech transition-colors ${
                mode === tab
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="label-tech mb-2 block">College email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="23e51a6610@hitam.org"
              className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="label-tech mb-2 block">Password</span>
            <input
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </label>

          {error ? (
            <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary/50 bg-primary/12 px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary transition hover:bg-primary/20 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Connecting" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
