import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronRight, Loader2, TriangleAlert } from "lucide-react";
import {
  fetchBranches,
  fetchSections,
  type Branch,
  type Section,
} from "../services/api";
import type { StudentContextValue } from "./Header";

/**
 * Year catalogue.
 * Phase 1 only contains 4th-year timetable data.
 */
export const YEAR_OPTIONS = [
  { value: 1, label: "1st Year", available: false },
  { value: 2, label: "2nd Year", available: false },
  { value: 3, label: "3rd Year", available: false },
  { value: 4, label: "4th Year", available: true },
] as const;

type Props = {
  onConfirm: (context: StudentContextValue) => void;
};

export function StudentContext({ onConfirm }: Props) {
  const [year, setYear] = useState<number>(4);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoadingBranches(true);
    setError(null);

    fetchBranches()
      .then((data) => {
        if (cancelled) return;
        setBranches(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingBranches(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (branchId === null) {
      setSections([]);
      setSectionId(null);
      return;
    }

    let cancelled = false;

    setLoadingSections(true);
    setSectionId(null);
    setError(null);

    fetchSections(branchId)
      .then((data) => {
        if (!cancelled) {
          setSections(data);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingSections(false);
      });

    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const branch = branches.find((b) => b.id === branchId);
  const section = sections.find((s) => s.id === sectionId);
  const ready = branch !== undefined && section !== undefined;

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-10 text-center">
        <p className="label-tech mb-4">
          HITAM • Campus Intelligence • Phase 1
        </p>

        <h1 className="font-display text-5xl font-bold tracking-[0.3em] text-foreground text-glow sm:text-7xl">
          HARVIS
        </h1>

        <p className="mt-4 font-display text-sm uppercase tracking-[0.3em] text-primary sm:text-base">
          HITAM AI Virtual Smart Assistant
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Inspired by JARVIS. Designed for HITAM.
        </p>
      </div>

      <div className="panel p-5 sm:p-7">
        <p className="label-tech mb-6">Initialise student context</p>

        {/* Year */}
        <Field label="Year" step="01">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {YEAR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={!option.available}
                onClick={() => setYear(option.value)}
                className={`rounded-md border px-3 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                  year === option.value && option.available
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : option.available
                      ? "border-border text-foreground/80 hover:border-primary/40"
                      : "cursor-not-allowed border-border/50 text-muted-foreground/45"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Only 4th-year timetable data is available in this phase.
          </p>
        </Field>

        {/* Branch */}
        <Field label="Branch" step="02">
          {loadingBranches ? (
            <SkeletonRow label="Loading branches" />
          ) : branches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No branches available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {branches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={branchId === item.id}
                  onClick={() => setBranchId(item.id)}
                  className={`min-h-12 rounded-md border px-3 py-2.5 font-mono text-xs uppercase tracking-widest transition-all ${
                    branchId === item.id
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_18px_oklch(0.72_0.15_205/12%)]"
                      : "border-border bg-transparent text-foreground/70 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                  }`}
                >
                  <span className="block whitespace-normal break-words">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Field>

        {/* Section */}
        <Field label="Section" step="03">
          {branchId === null ? (
            <p className="text-sm text-muted-foreground">
              Select a branch first.
            </p>
          ) : loadingSections ? (
            <SkeletonRow label="Loading sections" />
          ) : sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sections available for this branch.
            </p>
          ) : (
            <div
              role="radiogroup"
              aria-label="Select section"
              className="grid grid-cols-3 gap-2 sm:grid-cols-4"
            >
              {sections.map((item) => {
                const selected = sectionId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSectionId(item.id)}
                    className={`min-h-12 rounded-md border px-3 py-2.5 font-mono text-xs uppercase tracking-widest transition-all ${
                      selected
                        ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_oklch(0.72_0.15_205/15%)]"
                        : "border-border bg-transparent text-foreground/70 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          )}
        </Field>

        {error ? (
          <div className="mb-5 flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

            <div className="text-sm">
              <p className="text-foreground/90">{error}</p>

              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="mt-1 label-tech text-primary hover:underline"
              >
                Retry connection
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            if (!branch || !section) return;

            const yearLabel =
              YEAR_OPTIONS.find((o) => o.value === year)?.label ??
              `${year} Year`;

            onConfirm({
              year,
              yearLabel,
              branchId: branch.id,
              branchName: branch.name,
              sectionId: section.id,
              sectionName: section.name,
            });
          }}
          className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-primary/50 bg-primary/12 px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.28em] text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_28px_oklch(0.72_0.15_205/22%)] disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted-foreground disabled:shadow-none"
        >
          {ready ? <Check className="h-4 w-4" /> : null}
          Initialise HARVIS
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  step,
  children,
}: {
  label: string;
  step: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[0.625rem] text-primary/70">
          {step}
        </span>

        <span className="label-tech text-foreground/80">{label}</span>

        <span className="h-px flex-1 bg-border" />
      </div>

      {children}
    </div>
  );
}

function SkeletonRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {label}...
    </div>
  );
}