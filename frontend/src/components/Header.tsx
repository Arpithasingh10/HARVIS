import { StatusIndicator, type HarvisState } from "./StatusIndicator";
import type { StudentProfile } from "../services/studentProfile";

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
  profile,
  state,
  online,
  onProfile,
  onLogout,
}: {
  profile: StudentProfile;
  state: HarvisState;
  online: boolean;
  onProfile: () => void;
  onLogout: () => void;
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
            Year {profile.currentYear} • {profile.branch} • {sectionLabel(profile.section)}
          </span>

          <StatusIndicator state={state} className="hidden sm:inline-flex" />

          <details className="relative">
            <summary className="max-w-44 cursor-pointer list-none truncate rounded-full border border-primary/40 bg-surface px-3 py-2 label-tech text-foreground transition-colors hover:border-primary hover:text-primary">
              {profile.fullName} <span aria-hidden="true">▼</span>
            </summary>
            <div className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-md border border-border bg-surface-raised shadow-xl">
              <button
                type="button"
                onClick={onProfile}
                className="block w-full px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="block w-full border-t border-border px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                Logout
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
