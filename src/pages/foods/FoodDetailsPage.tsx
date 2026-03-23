import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Chip } from "../../components/ui/Chip";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { FoodRepository } from "../../features/dataset/repository/FoodRepository";
import { defaultUserProfileInput, loadUserProfileInput } from "../../features/user/storage/userProfileStore";
import { computePersonalizedAnalysis } from "../../features/recommendation/engine/riskScorer";
import { selectBetterAlternatives } from "../../features/recommendation/alternatives/betterAlternatives";
import type { FoodDatasetRecord, FoodIngredientRecord } from "../../features/dataset/types/dataset";
import type { RiskStatus, UserProfileInput } from "../../features/recommendation/types/recommendation";
import { getSession } from "../../features/auth/authStorage";

function statusTone(status: RiskStatus): "green" | "amber" | "rose" {
  if (status === "Safe") return "green";
  if (status === "Caution") return "amber";
  return "rose";
}

export function FoodDetailsPage() {
  const params = useParams();
  const foodId = Number(params.foodId);
  const navigate = useNavigate();

  const repo = useMemo(() => new FoodRepository({ mode: "json" }), []);

  // Load user profile - will trigger re-analysis when it changes
  const session = useMemo(() => getSession(), []);
  const userProfile = useMemo(() => {
    return session?.email ? loadUserProfileInput(session.email) ?? defaultUserProfileInput() : defaultUserProfileInput();
  }, [session?.email]);

  const [food, setFood] = useState<FoodDatasetRecord | null>(null);
  const [ingredients, setIngredients] = useState<FoodIngredientRecord[]>([]);
  const [status, setStatus] = useState<RiskStatus>("Caution");
  const [loading, setLoading] = useState(true);
  const [alternatives, setAlternatives] = useState<FoodDatasetRecord[]>([]);
  const [apiAnalysis, setApiAnalysis] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        if (!Number.isFinite(foodId)) throw new Error("Invalid food id.");
        setLoading(true);

        const f = await repo.getFoodById(foodId);
        if (!f) throw new Error("Food not found in dataset.");

        const ing = await repo.getIngredientsForFood(foodId);

        const analysis = computePersonalizedAnalysis({ food: f, ingredients: ing, user: userProfile });
        if (cancelled) return;

        const sameCategory = await repo.getFoodsByCategory(f.category);
        const better = selectBetterAlternatives({ currentFood: f, categoryFoods: sameCategory, limit: 4 });

        setFood(f);
        setIngredients(ing);
        setStatus(analysis.status);
        setAlternatives(better);

        // Fetch API analysis in parallel
        setApiLoading(true);
        try {
          const apiResponse = await fetch(`http://localhost:5000/api/analyze/food/${f.foodName}`);
          if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            if (!cancelled) {
              setApiAnalysis(apiData);
            }
          }
        } catch (apiError) {
          console.warn('API analysis not available:', apiError);
        } finally {
          if (!cancelled) setApiLoading(false);
        }
      } catch (e) {
        // Keep it simple for now; analysis page is the full experience.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();

    return () => {
      cancelled = true;
    };
  }, [foodId, repo, userProfile]);

  const tone = statusTone(status);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        {loading || !food ? (
          <div className="mx-auto max-w-3xl">
            <Card className="p-6">
              <div className="text-sm font-semibold text-gray-600">Loading food details</div>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-600">Food details</div>
                <h1 className="mt-2 text-3xl font-semibold text-ink-900">{food.foodName}</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip tone="neutral">{food.category}</Chip>
                  <Chip tone="neutral">{food.processingLevel}</Chip>
                  <Badge tone={tone}>{status}</Badge>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="text-sm font-semibold text-ink-900">Risk snapshot</div>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <span>Unhealthy %</span>
                    <span className="font-semibold text-ink-900">{food.unhealthyPercentage.toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={food.unhealthyPercentage} tone="rose" />
                  <div className="flex items-center justify-between gap-3">
                    <span>Dataset recommendation</span>
                    <span className="font-semibold text-ink-900">{food.datasetOverallRecommendation}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={() => navigate(`/analysis/${food.foodId}`)}>Open full analysis</Button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="p-6">
                <div className="text-sm font-semibold text-ink-900">Ingredient summary</div>
                <div className="mt-2 text-sm text-gray-600">
                  {food.totalIngredients} ingredients in dataset.
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Healthy</div>
                    <div className="mt-2 text-2xl font-semibold text-ink-900">{food.healthyPercentage.toFixed(1)}%</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Neutral</div>
                    <div className="mt-2 text-2xl font-semibold text-ink-900">{food.neutralPercentage.toFixed(1)}%</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Unhealthy</div>
                    <div className="mt-2 text-2xl font-semibold text-ink-900">{food.unhealthyPercentage.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="text-sm font-semibold text-ink-900">All ingredients</div>
                  <div className="mt-3 grid gap-3">
                    {ingredients.map((ing) => (
                      <div key={`${ing.ingredientOrder}-${ing.ingredientName}`} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="font-semibold text-ink-900">
                            {ing.ingredientOrder}. {ing.ingredientName}
                          </div>
                          <Badge tone={ing.ingredientType === "Healthy" ? "green" : ing.ingredientType === "Unhealthy" ? "rose" : "amber"}>
                            {ing.ingredientType}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          {ing.ingredientType === "Unhealthy" ? (
                            ing.reasonIfUnhealthy ? (
                              <span>
                                <span className="font-semibold text-ink-900">Why unhealthy:</span> {ing.reasonIfUnhealthy}
                              </span>
                            ) : (
                              "No reason provided in dataset."
                            )
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-semibold text-ink-900">Recommendation summary</div>
                <div className="mt-2 text-sm text-gray-700">
                  {status === "Safe"
                    ? "This item looks more suitable based on dataset risk signals and your profile."
                    : status === "Caution"
                      ? "This item may be okay with mindful portioning; review ingredient risks."
                      : "This item shows multiple risk signals; consider safer alternatives."}
                </div>

                <div className="mt-5">
                  <div className="text-sm font-semibold text-ink-900">Similar recommendations</div>
                  <div className="mt-1 text-sm text-gray-600">Same category, lower unhealthy risk.</div>
                  <div className="mt-4 grid gap-3">
                    {alternatives.map((a) => (
                      <button
                        key={a.foodId}
                        type="button"
                        onClick={() => navigate(`/analysis/${a.foodId}`)}
                        className="rounded-xl border border-gray-100 bg-white p-4 text-left transition hover:shadow-soft"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-ink-900">{a.foodName}</div>
                            <div className="mt-1 text-xs text-gray-600">{a.processingLevel}</div>
                          </div>
                          <Badge tone={riskToneFromPct(a.unhealthyPercentage)}>{a.unhealthyPercentage.toFixed(1)}%</Badge>
                        </div>
                      </button>
                    ))}
                    {alternatives.length === 0 ? <div className="text-sm text-gray-600">No alternatives found.</div> : null}
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

function riskToneFromPct(unhealthyPct: number): "green" | "amber" | "rose" {
  if (unhealthyPct < 30) return "green";
  if (unhealthyPct < 60) return "amber";
  return "rose";
}

