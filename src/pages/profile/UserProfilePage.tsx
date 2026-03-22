import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Badge } from "../../components/ui/Badge";
import { Chip } from "../../components/ui/Chip";
import { defaultUserProfileInput, loadUserProfileInput, saveUserProfileInput } from "../../features/user/storage/userProfileStore";
import { tokenize } from "../../lib/utils/tokenize";
import { OCRImageToText } from "../../components/ocr/OCRImageToText";
import { getSession } from "../../features/auth/authStorage";

const HEALTH_CONDITIONS: string[] = [
  "Diabetes",
  "High Blood Pressure (Hypertension)",
  "Heart Disease",
  "Obesity or Overweight",
  "Kidney Disease",
  "High Cholesterol",
  "Lactose Intolerance",
  "Caffeine Sensitivity",
  "Anxiety or Sleep Issues",
  "Children (Hyperactivity)",
  "PCOS",
  "Fatty Liver Risk",
  "Thyroid Issues",
];

function computeBmi(heightCm: number, weightKg: number): number | null {
  if (heightCm <= 0 || weightKg <= 0) return null;
  const hM = heightCm / 100;
  return weightKg / (hM * hM);
}

export function UserProfilePage() {
  const navigate = useNavigate();

  const session = React.useMemo(() => getSession(), []);
  const existing = React.useMemo(() => {
    if (!session?.email) return null;
    return loadUserProfileInput(session.email);
  }, [session?.email]);

  const fallback = defaultUserProfileInput();

  const [age, setAge] = useState<number>(existing?.age ?? fallback.age);
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "Prefer not to say">(
    existing?.gender ?? fallback.gender
  );
  const [heightCm, setHeightCm] = useState<number>(existing?.heightCm ?? fallback.heightCm);
  const [weightKg, setWeightKg] = useState<number>(existing?.weightKg ?? fallback.weightKg);
  const [allergiesRaw, setAllergiesRaw] = useState<string>((existing?.allergies ?? []).join(", "));
  const [selectedHealthConditions, setSelectedHealthConditions] = useState<string[]>(existing?.selectedHealthConditions ?? fallback.selectedHealthConditions);

  const [touched, setTouched] = useState(false);

  const bmi = useMemo(() => computeBmi(heightCm, weightKg), [heightCm, weightKg]);

  const allergiesTokens = useMemo(() => tokenize(allergiesRaw), [allergiesRaw]);

  const heightError = touched && heightCm <= 0 ? "Enter a valid height." : "";
  const weightError = touched && weightKg <= 0 ? "Enter a valid weight." : "";
  const allergiesError = touched && allergiesRaw.trim().length > 0 && allergiesTokens.length === 0 ? "Allergy input looks empty after cleanup." : "";

  function toggleCondition(condition: string) {
    setSelectedHealthConditions((prev) => (prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]));
  }

  function submit() {
    setTouched(true);
    const invalid = (heightCm <= 0 || weightKg <= 0) || (allergiesError.length > 0);
    if (invalid) return;

    const profile = {
      age,
      gender,
      heightCm,
      weightKg,
      bmi: bmi ?? 0,
      allergies: allergiesTokens,
      selectedHealthConditions,
    };

    if (!session?.email) return;
    saveUserProfileInput(profile, session.email);
    navigate("/home");
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-ink-900">Your Profile</h1>
            <p className="mt-2 text-gray-600">Manage your health information for personalized recommendations</p>
          </div>
          <div className="rounded-2xl border-2 border-chai-100 bg-gradient-to-br from-chai-50 to-white p-6 shadow-md">
            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">BMI</div>
            <div className="mt-3 text-3xl font-bold text-chai-100">
              {bmi ? bmi.toFixed(1) : "—"}
            </div>
            <div className="mt-1 text-xs text-gray-600 font-medium">Your calculated BMI</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-8 shadow-lg fade-in">
            <div className="text-lg font-bold text-ink-900 mb-6">Basic Information</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min={0}
              />
              <div className="space-y-1">
                <div className="text-sm font-semibold text-gray-700">Gender</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(["Male", "Female", "Other", "Prefer not to say"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={
                        selectedChipClass(g === gender)
                      }
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Height (cm)"
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                min={0}
                error={heightError || undefined}
              />
              <Input
                label="Weight (kg)"
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                min={0}
                error={weightError || undefined}
              />
            </div>

            <div className="mt-6">
              <Textarea
                label="Allergies (free text)"
                value={allergiesRaw}
                onChange={(e) => setAllergiesRaw(e.target.value)}
                placeholder="Example: peanuts, lactose, caffeine"
                hint="We convert your input into matching-friendly tokens for ingredient-name/note matching."
                error={allergiesError || undefined}
              />
              {allergiesTokens.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {allergiesTokens.map((t) => (
                    <Badge key={t} tone="rose">
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              <OCRImageToText
                label="Extract allergies from an image (optional)"
                onTextExtracted={(text) => {
                  // Fill the same field the user edits manually.
                  if (text && text.length > 0) setAllergiesRaw(text);
                }}
              />
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-ink-900">Health conditions</div>
              <div className="mt-2 text-sm text-gray-600">Select conditions that your recommendations should consider.</div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {HEALTH_CONDITIONS.map((c) => {
                  const active = selectedHealthConditions.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCondition(c)}
                      className={active ? selectedChipClass(true) : selectedChipClass(false)}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Health Conditions: <span className="font-bold text-ink-900">{selectedHealthConditions.length}</span>
              </div>
              <Button onClick={submit} className="py-3">Save Profile</Button>
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="p-6">
              <div className="text-sm font-semibold text-ink-900">Saved foods</div>
              <div className="mt-2 text-sm text-gray-600">Not connected yet in this prototype UI. You can add “Save” buttons on the analysis page later.</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip tone="neutral">Saved items will appear here</Chip>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-semibold text-ink-900">Recommendation history</div>
              <div className="mt-2 text-sm text-gray-600">History tracking can be enabled by saving analysis events to localStorage.</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip tone="neutral">Future enhancement</Chip>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-semibold text-ink-900">Account Settings</div>
              <div className="mt-2 text-sm text-gray-700">Manage your account preferences and data.</div>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <div className="text-sm font-medium text-ink-900">Email Notifications</div>
                    <div className="text-xs text-gray-600">Receive updates about your food analysis</div>
                  </div>
                  <Button variant="secondary" onClick={() => alert('Feature coming soon!')}>
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <div className="text-sm font-medium text-ink-900">Data Export</div>
                    <div className="text-xs text-gray-600">Download your profile and saved foods</div>
                  </div>
                  <Button variant="secondary" onClick={() => alert('Feature coming soon!')}>
                    Export Data
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <div className="text-sm font-medium text-ink-900">Privacy Settings</div>
                    <div className="text-xs text-gray-600">Control your data visibility</div>
                  </div>
                  <Button variant="secondary" onClick={() => alert('Feature coming soon!')}>
                    Manage Privacy
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-ink-900">Delete Account</div>
                    <div className="text-xs text-gray-600">Permanently remove your data</div>
                  </div>
                  <Button variant="secondary" onClick={() => {
                    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      localStorage.clear();
                      navigate('/signup');
                    }
                  }} className="text-red-600 hover:text-red-700">
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function selectedChipClass(active: boolean) {
  return active
    ? "rounded-full border border-chai-100 bg-chai-50 px-4 py-2 text-xs font-semibold text-chai-900 transition hover:bg-chai-100"
    : "rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50";
}

