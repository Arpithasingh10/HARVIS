import { useState, type FormEvent } from "react";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import {
  BRANCHES,
  friendlyFirebaseError,
  type NewStudentProfile,
  type StudentProfile,
} from "../services/studentProfile";

type Props = {
  initialProfile?: StudentProfile;
  onSave: (profile: NewStudentProfile) => Promise<void>;
  onCancel?: () => void;
};

const YEARS = [1, 2, 3, 4];
const SECTIONS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function StudentProfileForm({ initialProfile, onSave, onCancel }: Props) {
  const [fullName, setFullName] = useState(initialProfile?.fullName ?? "");
  const [rollNumber, setRollNumber] = useState(initialProfile?.rollNumber ?? "");
  const [branch, setBranch] = useState<NewStudentProfile["branch"]>(
    initialProfile?.branch ?? "CSM",
  );
  const [batch, setBatch] = useState(initialProfile?.batch ?? "");
  const [section, setSection] = useState<NewStudentProfile["section"]>(
    initialProfile?.section ?? "A",
  );
  const [currentYear, setCurrentYear] = useState(
    initialProfile?.currentYear ?? 4,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editingAcademicProgress = Boolean(initialProfile);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedName = fullName.trim();
    const normalizedRoll = rollNumber.trim().toUpperCase();
    if (!editingAcademicProgress && normalizedName.length === 0) {
      setError("Enter your full name.");
      return;
    }
    if (!editingAcademicProgress && !/^\d{2}[A-Z0-9]{8}$/.test(normalizedRoll)) {
      setError("Enter a valid 10-character roll number, for example 23E51A6610.");
      return;
    }
    if (!editingAcademicProgress && !/^\d{4}-\d{4}$/.test(batch.trim())) {
      setError("Enter the batch as a year range, for example 2023-2027.");
      return;
    }

    setBusy(true);
    try {
      await onSave({
        fullName: normalizedName,
        rollNumber: normalizedRoll,
        branch,
        batch: batch.trim(),
        section,
        currentYear,
      });
    } catch (cause) {
      setError(friendlyFirebaseError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel w-full max-w-2xl p-5 sm:p-8">
      <p className="label-tech mb-2">
        {editingAcademicProgress ? "Academic progress" : "Student onboarding"}
      </p>
      <h1 className="mb-7 font-display text-2xl font-bold text-foreground">
        {editingAcademicProgress ? "Update your year or section" : "Complete Your Profile"}
      </h1>

      {!editingAcademicProgress ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="label-tech mb-2 block">Full name</span>
            <input
              required
              maxLength={100}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="profile-input"
            />
          </label>
          <label className="block">
            <span className="label-tech mb-2 block">Roll number</span>
            <input
              required
              maxLength={10}
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value.toUpperCase())}
              placeholder="23E51A6610"
              className="profile-input"
            />
          </label>
          <label className="block">
            <span className="label-tech mb-2 block">Branch</span>
            <select
              required
              value={branch}
              onChange={(event) => setBranch(event.target.value as NewStudentProfile["branch"])}
              className="profile-input"
            >
              {BRANCHES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.rollCode} → {item.code}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-tech mb-2 block">Batch</span>
            <input
              required
              maxLength={9}
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              placeholder="2023-2027"
              className="profile-input"
            />
          </label>
        </div>
      ) : null}

      <div className={`mt-5 grid gap-5 ${editingAcademicProgress ? "" : "sm:grid-cols-2"}`}>
        <label className="block">
          <span className="label-tech mb-2 block">Section</span>
          <select
            required
            value={section}
            onChange={(event) => setSection(event.target.value as NewStudentProfile["section"])}
            className="profile-input"
          >
            {SECTIONS.map((option) => (
              <option key={option} value={option}>
                Section {option}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label-tech mb-2 block">Current year</span>
          <select
            required
            value={currentYear}
            onChange={(event) => setCurrentYear(Number(event.target.value))}
            className="profile-input"
          >
            {YEARS.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div role="alert" className="mt-5 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-md border border-border px-5 py-3 label-tech text-foreground/80 hover:border-primary/40">
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-primary/50 bg-primary/12 px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-primary transition hover:bg-primary/20 disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {busy ? "Saving" : editingAcademicProgress ? "Save progress" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

export function ProfileSetup({
  onSave,
}: {
  onSave: (profile: NewStudentProfile) => Promise<void>;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="hud-vignette pointer-events-none absolute inset-0" />
      <div className="relative z-10 w-full max-w-2xl">
        <StudentProfileForm onSave={onSave} />
      </div>
    </main>
  );
}
