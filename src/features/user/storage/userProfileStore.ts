import type { UserProfileInput } from "../../recommendation/types/recommendation";

const PREFIX = "efood.userProfile.";

function profileKey(email: string): string {
  return `${PREFIX}${email.trim().toLowerCase()}`;
}

export function loadUserProfileInput(email: string): UserProfileInput | null {
  try {
    const raw = localStorage.getItem(profileKey(email));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfileInput>;
    // Minimal shape validation: allergies/conditions arrays are required for the recommendation engine.
    if (!Array.isArray(parsed.allergies)) return null;
    if (!Array.isArray(parsed.selectedHealthConditions)) return null;
    
    // Merge with defaults to ensure all fields are present (handles old profiles missing bmi, etc.)
    const defaultProfile = defaultUserProfileInput();
    const merged: UserProfileInput = {
      age: parsed.age ?? defaultProfile.age,
      gender: parsed.gender ?? defaultProfile.gender,
      heightCm: parsed.heightCm ?? defaultProfile.heightCm,
      weightKg: parsed.weightKg ?? defaultProfile.weightKg,
      bmi: parsed.bmi ?? defaultProfile.bmi,
      allergies: parsed.allergies ?? defaultProfile.allergies,
      selectedHealthConditions: parsed.selectedHealthConditions ?? defaultProfile.selectedHealthConditions,
    };
    return merged;
  } catch {
    return null;
  }
}

export function saveUserProfileInput(profile: UserProfileInput, email: string): void {
  localStorage.setItem(profileKey(email), JSON.stringify(profile));
}

export function clearUserProfileInput(email: string): void {
  localStorage.removeItem(profileKey(email));
}

export function defaultUserProfileInput(): UserProfileInput {
  return {
    age: 0,
    gender: "Prefer not to say",
    heightCm: 0,
    weightKg: 0,
    bmi: 0,
    allergies: [],
    selectedHealthConditions: [],
  };
}

export function loadAllUserProfiles(): Array<{ email: string; profile: UserProfileInput }> {
  const out: Array<{ email: string; profile: UserProfileInput }> = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (!k.startsWith(PREFIX)) continue;
      const email = k.slice(PREFIX.length);
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as UserProfileInput;
      if (!Array.isArray(parsed?.allergies)) continue;
      if (!Array.isArray(parsed?.selectedHealthConditions)) continue;
      out.push({ email, profile: parsed });
    }
  } catch {
    // ignore
  }
  return out;
}

