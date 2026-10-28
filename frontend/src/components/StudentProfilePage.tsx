import { useState } from "react";
import { ArrowLeft, UserRound } from "lucide-react";
import { StudentProfileForm } from "./StudentProfileForm";
import type {
  NewStudentProfile,
  StudentProfile,
} from "../services/studentProfile";

type Props = {
  profile: StudentProfile;
  onSaveProgress: (profile: NewStudentProfile) => Promise<void>;
  onBack: () => void;
};

const PROFILE_FIELDS: Array<[string, keyof StudentProfile]> = [
  ["Name", "fullName"],
  ["Roll number", "rollNumber"],
  ["Email", "email"],
  ["Branch", "branch"],
  ["Batch", "batch"],
  ["Section", "section"],
  ["Current year", "currentYear"],
];

export function StudentProfilePage({ profile, onSaveProgress, onBack }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6">
      <div className="hud-grid pointer-events-none fixed inset-0 opacity-35" />
      <div className="hud-vignette pointer-events-none fixed inset-0" />
      <section className="relative z-10 mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 label-tech text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to HARVIS
        </button>

        {editing ? (
          <StudentProfileForm
            initialProfile={profile}
            onSave={async (changes) => {
              await onSaveProgress(changes);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="panel p-5 sm:p-8">
            <div className="mb-7 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <p className="label-tech">Student profile</p>
                <h1 className="mt-1 font-display text-2xl font-bold text-foreground">
                  {profile.fullName}
                </h1>
              </div>
            </div>

            <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
              {PROFILE_FIELDS.map(([label, key]) => (
                <div key={key} className="bg-surface/80 px-4 py-4">
                  <dt className="label-tech mb-2">{label}</dt>
                  <dd className="break-words text-sm font-medium text-foreground">
                    {String(profile[key] ?? "")}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Your name, roll number, branch and batch stay fixed after setup.
              Update your year or section here as you progress.
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-6 rounded-md border border-primary/50 bg-primary/12 px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/20"
            >
              Update year or section
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
