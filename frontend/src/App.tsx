import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { AlertTriangle, Loader2 } from "lucide-react";
import { AuthGate } from "./components/AuthGate";
import { ProfileSetup } from "./components/StudentProfileForm";
import { StudentProfilePage } from "./components/StudentProfilePage";
import { Assistant } from "./pages/Assistant";
import { firebaseConfigured, getAuthClient } from "./lib/firebase";
import {
  createStudentProfile,
  friendlyFirebaseError,
  getStudentProfile,
  signOutStudent,
  updateStudentAcademicProgress,
  type NewStudentProfile,
  type StudentProfile as StudentProfileData,
} from "./services/studentProfile";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [profileStatus, setProfileStatus] = useState<
    "loading" | "missing" | "complete" | "error"
  >("loading");
  const [page, setPage] = useState<"dashboard" | "profile">("dashboard");
  const [actionError, setActionError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseConfigured) {
      setAuthLoading(false);
      return;
    }

    return onAuthStateChanged(
      getAuthClient(),
      (nextUser) => {
        setUser(nextUser);
        setAuthLoading(false);
        setAuthError(null);
        setActionError(null);
        setProfileError(null);
        setProfile(null);
        setPage("dashboard");
        setProfileStatus(nextUser ? "loading" : "missing");
      },
      () => {
        setAuthError("HARVIS could not verify your sign-in. Please sign in again.");
        setAuthLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    setProfileStatus("loading");
    getStudentProfile(user.uid)
      .then((savedProfile) => {
        if (cancelled) return;
        setProfile(savedProfile);
        setProfileStatus(savedProfile ? "complete" : "missing");
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setProfileError(friendlyFirebaseError(error));
          setProfileStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function saveInitialProfile(details: NewStudentProfile) {
    if (!user) throw new Error("A signed-in student account is required.");
    const savedProfile = await createStudentProfile(user, details);
    setProfile(savedProfile);
    setProfileStatus("complete");
    setPage("dashboard");
  }

  async function saveAcademicProgress(details: NewStudentProfile) {
    if (!user || !profile) throw new Error("Your profile could not be loaded.");
    await updateStudentAcademicProgress(user.uid, {
      currentYear: details.currentYear,
      section: details.section,
    });
    setProfile({ ...profile, currentYear: details.currentYear, section: details.section });
    setActionError(null);
  }

  async function retryProfileLoad() {
    if (!user) return;
    setProfileStatus("loading");
    setProfileError(null);
    try {
      const savedProfile = await getStudentProfile(user.uid);
      setProfile(savedProfile);
      setProfileStatus(savedProfile ? "complete" : "missing");
    } catch (error) {
      setProfileError(friendlyFirebaseError(error));
      setProfileStatus("error");
    }
  }

  async function logout() {
    setActionError(null);
    try {
      await signOutStudent();
    } catch (error) {
      setActionError(friendlyFirebaseError(error));
    }
  }

  if (!firebaseConfigured) {
    return (
      <Notice
        title="Firebase setup required"
        message="Add the Firebase web app settings to frontend/.env.local, then restart the frontend."
      />
    );
  }

  if (authLoading || (user && profileStatus === "loading")) {
    return <Loading />;
  }

  if (authError) {
    return (
      <Notice
        title="Sign-in needs attention"
        message={authError}
        action={<button type="button" onClick={() => setAuthError(null)} className="label-tech text-primary">Continue</button>}
      />
    );
  }

  if (!user) return <AuthGate />;

  if (profileStatus === "error") {
    return (
      <Notice
        title="Profile unavailable"
        message={
          profileError ??
          "HARVIS could not load your student profile. Check your connection and try again."
        }
        action={
          <button
            type="button"
            onClick={() => void retryProfileLoad()}
            className="label-tech text-primary"
          >
            Retry
          </button>
        }
      />
    );
  }

  if (profileStatus === "missing") {
    return <ProfileSetup onSave={saveInitialProfile} />;
  }

  if (!profile) return <Loading />;

  if (page === "profile") {
    return (
      <StudentProfilePage
        profile={profile}
        onSaveProgress={saveAcademicProgress}
        onBack={() => setPage("dashboard")}
      />
    );
  }

  return (
    <Assistant
      profile={profile}
      onProfile={() => setPage("profile")}
      onLogout={() => void logout()}
      actionError={actionError}
    />
  );
}

function Loading() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="flex items-center gap-3 label-tech text-primary">
        <Loader2 className="h-5 w-5 animate-spin" />
        Connecting to HARVIS
      </div>
    </main>
  );
}

function Notice({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="panel max-w-lg p-6">
        <div className="mb-3 flex items-center gap-3 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{message}</p>
        {action}
      </section>
    </main>
  );
}
