import type { AgeGroup, AgeGroupId, StudentProfile } from "./types";

export const AGE_GROUPS: AgeGroup[] = [
  {
    id: "early-explorer",
    label: "Early Explorer",
    minAge: 5,
    maxAge: 7,
    description: "Curious first steps into science and making.",
  },
  {
    id: "young-explorer",
    label: "Young Explorer",
    minAge: 8,
    maxAge: 12,
    description: "Hands-on building with growing confidence.",
  },
  {
    id: "teen-learner",
    label: "Teen Learner",
    minAge: 13,
    maxAge: 17,
    description: "Deeper study with real tools and concepts.",
  },
  {
    id: "advanced-learner",
    label: "Advanced Learner",
    minAge: 18,
    maxAge: null,
    description: "Independent projects and scientific thinking.",
  },
];

const MIN_AGE = 5;

export function resolveAgeGroup(age: number): AgeGroup {
  for (const group of AGE_GROUPS) {
    if (group.maxAge === null ? age >= group.minAge : age >= group.minAge && age <= group.maxAge) {
      return group;
    }
  }
  return AGE_GROUPS[0]; // below minimum (shouldn't pass validation) → youngest group
}

export function ageGroupById(id: AgeGroupId): AgeGroup {
  return AGE_GROUPS.find((g) => g.id === id) ?? AGE_GROUPS[0];
}

export function isAgeValid(age: number): boolean {
  return Number.isInteger(age) && age >= MIN_AGE;
}

export function isNameValid(name: string): boolean {
  return name.trim().length > 0;
}

export function createStudentProfile(input: {
  name: string;
  age: number;
  studentId?: string;
}): StudentProfile {
  const trimmedName = input.name.trim();
  const ageGroup = resolveAgeGroup(input.age);
  return {
    // Non-cryptographic local id; sufficient to identify a local-first profile.
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: trimmedName,
    age: input.age,
    ageGroup,
    studentId: input.studentId?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
}

export const MIN_STUDENT_AGE = MIN_AGE;