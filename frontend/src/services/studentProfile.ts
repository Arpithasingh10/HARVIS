import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { getAuthClient, getFirestoreClient } from "../lib/firebase";

export const COLLEGE_EMAIL_SUFFIX = "@hitam.org";

export const BRANCHES = [
  {
    rollCode: "02",
    code: "EEE",
    label: "Electrical and Electronics Engineering",
  },
  { rollCode: "03", code: "MECH", label: "Mechanical Engineering" },
  {
    rollCode: "04",
    code: "ECE",
    label: "Electronics and Communication Engineering",
  },
  { rollCode: "05", code: "CSE", label: "Computer Science and Engineering" },
  {
    rollCode: "66",
    code: "CSM",
    label: "Computer Science and Machine Learning",
  },
  { rollCode: "67", code: "CSD", label: "Computer Science and Data Science" },
] as const;

export type BranchCode = (typeof BRANCHES)[number]["code"];
export type SectionCode = string;

export type StudentProfile = {
  uid: string;
  email: string;
  fullName: string;
  rollNumber: string;
  branch: BranchCode;
  batch: string;
  section: SectionCode;
  currentYear: number;
  profileCompleted: true;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type NewStudentProfile = Omit<
  StudentProfile,
  "uid" | "email" | "profileCompleted" | "createdAt" | "updatedAt"
>;

export function isCollegeEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(COLLEGE_EMAIL_SUFFIX);
}

export async function signUpWithCollegeEmail(
  email: string,
  password: string,
): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isCollegeEmail(normalizedEmail)) {
    throw new Error("Use your HITAM college email ending in @hitam.org.");
  }

  const credential = await createUserWithEmailAndPassword(
    getAuthClient(),
    normalizedEmail,
    password,
  );
  return credential.user;
}

export async function signInWithCollegeEmail(
  email: string,
  password: string,
): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isCollegeEmail(normalizedEmail)) {
    throw new Error("Use your HITAM college email ending in @hitam.org.");
  }

  const credential = await signInWithEmailAndPassword(
    getAuthClient(),
    normalizedEmail,
    password,
  );
  return credential.user;
}

export async function signOutStudent(): Promise<void> {
  await signOut(getAuthClient());
}

export async function getStudentProfile(
  uid: string,
): Promise<StudentProfile | null> {
  const snapshot = await getDoc(doc(getFirestoreClient(), "users", uid));
  if (!snapshot.exists()) return null;

  const profile = snapshot.data() as StudentProfile;
  return profile.profileCompleted === true ? profile : null;
}

export async function createStudentProfile(
  user: User,
  profile: NewStudentProfile,
): Promise<StudentProfile> {
  const email = user.email?.trim().toLowerCase();
  if (!email || !isCollegeEmail(email)) {
    throw new Error("A verified HITAM college email is required.");
  }

  const studentProfile: StudentProfile = {
    ...profile,
    uid: user.uid,
    email,
    profileCompleted: true,
  };

  await setDoc(doc(getFirestoreClient(), "users", user.uid), {
    ...studentProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return studentProfile;
}

export async function updateStudentAcademicProgress(
  uid: string,
  changes: Pick<StudentProfile, "currentYear" | "section">,
): Promise<void> {
  await updateDoc(doc(getFirestoreClient(), "users", uid), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

export function friendlyFirebaseError(error: unknown): string {
  if (error instanceof Error && error.message.startsWith("Use your ")) {
    return error.message;
  }
  if (error instanceof Error && error.message.startsWith("A verified ")) {
    return error.message;
  }

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists for this email. Sign in instead.";
    case "auth/invalid-email":
      return "Enter a valid HITAM college email address.";
    case "auth/weak-password":
      return "Choose a stronger password with at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in is unavailable. Contact the HARVIS administrator.";
    case "auth/user-disabled":
      return "This account is disabled. Contact the HARVIS administrator.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a little and try again.";
    case "auth/network-request-failed":
    case "unavailable":
    case "deadline-exceeded":
      return "HARVIS could not connect. Check your internet connection and try again.";
    case "unauthenticated":
    case "auth/user-token-expired":
      return "Your sign-in expired. Log out and sign in again.";
    case "permission-denied":
      return "HARVIS could not access your profile. Check that Firestore rules are published.";
    case "not-found":
      return "The Firestore database is not available yet. Create the database in the Firebase console, then publish the HARVIS Firestore rules.";
    case "already-exists":
      return "A profile already exists for this account. Refresh and sign in again.";
    default:
      return "HARVIS could not complete that request. Please try again.";
  }
}
