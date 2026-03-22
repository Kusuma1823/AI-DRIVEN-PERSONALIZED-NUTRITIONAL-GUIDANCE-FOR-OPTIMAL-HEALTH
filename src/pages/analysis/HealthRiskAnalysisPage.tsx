import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Chip } from "../../components/ui/Chip";
import { Button } from "../../components/ui/Button";
import { FoodRepository } from "../../features/dataset/repository/FoodRepository";
import { RecommendationFacade } from "../../features/recommendation/facade/recommendationFacade";
import { defaultUserProfileInput, loadUserProfileInput } from "../../features/user/storage/userProfileStore";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { FoodAnalysisResult, RiskStatus } from "../../features/recommendation/types/recommendation";
import { getSession } from "../../features/auth/authStorage";

function tone(status: RiskStatus): "green" | "amber" | "rose" {
  if (status === "Safe") return "green";
  if (status === "Caution") return "amber";
  return "rose";
}

export function HealthRiskAnalysisPage() {
  const { foodId: foodIdRaw } = useParams();
  const foodId = Number(foodIdRaw);
  const navigate = useNavigate();

  const repo = useMemo(() => new FoodRepository({ mode: "json" }), []);
  const facade = useMemo(() => new RecommendationFacade(repo), [repo]);

  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        setResult(null);

        if (!Number.isFinite(foodId)) throw new Error("Invalid food id.");
        const session = getSession();
        const user = session?.email ? loadUserProfileInput(session.email) ?? defaultUserProfileInput() : defaultUserProfileInput();
        const analysis = await facade.analyzeFood({ foodId, user, alternativesLimit: 0 });
        if (!cancelled) setResult(analysis);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to compute analysis.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [foodId, facade]);

  const unhealthyIngredients = result?.ingredients.filter((i) => i.ingredientType === "Unhealthy") ?? [];

  const tags = useMemo(() => {
    if (!unhealthyIngredients) return [];
    const set = new Set<string>();
    for (const i of unhealthyIngredients) if (i.healthConcernTag) set.add(i.healthConcernTag);
    return Array.from(set).sort();
  }, [unhealthyIngredients]);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        {loading ? (
          <div className="mx-auto max-w-3xl">
            <Card className="p-6">
              <div className="text-sm font-semibold text-gray-600">Computing risk signals...</div>
            </Card>
          </div>
        ) : error || !result ? (
          <div className="mx-auto max-w-3xl">
            <Card className="p-6">
              <div className="text-sm font-semibold text-rose-700">Could not load analysis.</div>
              <div className="mt-2 text-sm text-gray-700">{error}</div>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-600">Health risk / ingredient analysis</div>
                <h1 className="mt-2 text-3xl font-semibold text-ink-900">{result.food.foodName}</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip tone="neutral">{result.food.category}</Chip>
                  <Chip tone="neutral">{result.food.processingLevel}</Chip>
                  <Badge tone={tone(result.status)}>{result.status}</Badge>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="text-sm font-semibold text-ink-900">Unhealthy percentage</div>
                <div className="mt-2 text-sm text-gray-700">
                  {result.unhealthyPercentage.toFixed(1)}% of ingredients flagged as unhealthy.
                </div>
                <div className="mt-3">
                  <ProgressBar value={result.unhealthyPercentage} tone="rose" />
                </div>
                <div className="mt-4">
                  <Button variant="secondary" onClick={() => navigate(`/analysis/${result.food.foodId}`)}>
                    Open full dashboard
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <Card className="p-6">
                <div className="text-sm font-semibold text-ink-900">Risk signals (from dataset tags)</div>
                <div className="mt-2 text-sm text-gray-600">
                  Highlighted based on ingredients marked `Unhealthy` in your dataset (shows `health_concern_tag` + `reason_if_unhealthy`).
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.length > 0 ? tags.map((t) => <Chip key={t} tone="rose">{t}</Chip>) : <div className="text-sm text-gray-600">No concern tags found for Unhealthy ingredients.</div>}
                </div>

                <div className="mt-6 divide-y divide-gray-100">
                  {unhealthyIngredients.length > 0 ? (
                    unhealthyIngredients.map((ing) => (
                      <div key={`${ing.foodId}-${ing.ingredientOrder}-${ing.ingredientName}`} className="py-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-ink-900">
                              {ing.ingredientOrder}. {ing.ingredientName}
                            </div>
                            {ing.healthConcernTag ? (
                              <div className="mt-2">
                                <Chip tone="rose">{ing.healthConcernTag}</Chip>
                              </div>
                            ) : null}
                          </div>
                          <Badge tone="rose">Unhealthy</Badge>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          {ing.reasonIfUnhealthy ? (
                            <>
                              <span className="font-semibold text-ink-900">Reason:</span> {ing.reasonIfUnhealthy}
                            </>
                          ) : (
                            "No reason provided in dataset."
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-sm text-gray-600">No unhealthy ingredients flagged for this food in the dataset.</div>
                  )}
                </div>
              </Card>

              <div className="grid gap-6">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-ink-900">Personalized warning</div>
                  <div className="mt-2 text-sm text-gray-700">
                    {result.matchedHealthConditions.length > 0 ? (
                      <>
                        Matched health condition(s):{" "}
                        <span className="font-semibold">{result.matchedHealthConditions.join(", ")}</span>.
                      </>
                    ) : (
                      <>No direct health-condition overlap found for this item in dataset tags.</>
                    )}
                    {result.allergyMatches.length > 0 ? (
                      <>
                        <div className="mt-3">
                          Allergy-related token matches:{" "}
                          <span className="font-semibold">{result.allergyMatches.map((m) => m.token).join(", ")}</span>.
                        </div>
                      </>
                    ) : null}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-semibold text-ink-900">Suggestions</div>
                  <div className="mt-2 text-sm text-gray-700">
                    Based strictly on dataset tags:
                    <div className="mt-2 space-y-2">
                      <div>- Prefer foods with fewer `Unhealthy` ingredients.</div>
                      <div>- If you have matched conditions/allergies, consider safer alternatives from the same category.</div>
                      <div>- Always review ingredient reasons and tags for clarity.</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

