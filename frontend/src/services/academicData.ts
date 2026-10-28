import {
  collection,
  query,
  where,
  type DocumentData,
  type Query,
} from "firebase/firestore";
import { getFirestoreClient } from "../lib/firebase";
import type { StudentProfile } from "./studentProfile";

export const ACADEMIC_COLLECTIONS = [
  "academic_data",
  "subjects",
  "faculty",
  "timetables",
  "examinations",
  "activities",
] as const;

export type AcademicCollection = (typeof ACADEMIC_COLLECTIONS)[number];

export function buildStudentAcademicQuery(
  collectionName: AcademicCollection,
  profile: Pick<
    StudentProfile,
    "branch" | "section" | "batch" | "currentYear"
  >,
): Query<DocumentData> {
  return query(
    collection(getFirestoreClient(), collectionName),
    where("branch", "==", profile.branch),
    where("section", "==", profile.section),
    where("batch", "==", profile.batch),
    where("academicYear", "==", profile.currentYear),
  );
}
