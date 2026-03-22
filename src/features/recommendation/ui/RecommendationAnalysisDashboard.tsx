import React, { useState, useMemo, useEffect } from "react";
import type { FoodAnalysisResult, RiskStatus } from "../types/recommendation";
import { Card } from "../../../components/ui/Card";
import { Chip } from "../../../components/ui/Chip";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Alert } from "../../../components/ui/Alert";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Link } from "react-router-dom";
import { getSession } from "../../../features/auth/authStorage";
import { saveFood, removeSavedFood, isFoodSaved, getSavedFoods } from "../../../features/savedFoods/savedFoodsStorage";

function statusTone(status: RiskStatus): "green" | "amber" | "rose" {
  if (status === "Safe") return "green";
  if (status === "Caution") return "amber";
  return "rose";
}

function ingredientTone(type: "Healthy" | "Neutral" | "Unhealthy"): "green" | "amber" | "rose" | "neutral" {
  if (type === "Healthy") return "green";
  if (type === "Unhealthy") return "rose";
  return "amber";
}

export function RecommendationAnalysisDashboard(props: { result: FoodAnalysisResult; options: any }) {
  const { result, options } = props;
  const [ingredientSearch, setIngredientSearch] = useState("");
  const session = useMemo(() => getSession(), []);
  const [isSaved, setIsSaved] = useState(false);
  const [savingFood, setSavingFood] = useState(false);

  // Load saved state when component mounts or session/result changes
  useEffect(() => {
    async function checkIfSaved() {
      if (!session) {
        setIsSaved(false);
        return;
      }
      try {
        const saved = await isFoodSaved(session.userId, String(result.food.foodId));
        setIsSaved(saved);
      } catch (e) {
        console.error("Error checking if food is saved:", e);
        setIsSaved(false);
      }
    }
    checkIfSaved();
  }, [session, result.food.foodId]);
  
  const tone = statusTone(result.status);
  const flagByKey = new Map(
    result.ingredientLevelFlags.map((f) => [`${f.ingredientOrder}|${f.ingredientName}`, f] as const)
  );

  const filteredIngredients = useMemo(() => {
    if (!ingredientSearch.trim()) return result.ingredients;
    const search = ingredientSearch.toLowerCase();
    return result.ingredients.filter(ing => 
      ing.ingredientName.toLowerCase().includes(search) ||
      ing.ingredientType.toLowerCase().includes(search) ||
      (ing.healthConcernTag && ing.healthConcernTag.toLowerCase().includes(search))
    );
  }, [result.ingredients, ingredientSearch]);

  const handleSaveFood = async () => {
    if (!session || savingFood) return;
    
    setSavingFood(true);
    try {
      if (isSaved) {
        // Remove from saved
        const savedFoods = await getSavedFoods(session.userId);
        const savedFood = savedFoods.find((f: any) => f.foodId === String(result.food.foodId));
        if (savedFood) {
          await removeSavedFood(session.userId, savedFood.id);
          setIsSaved(false);
        }
      } else {
        // Save food
        await saveFood(session.userId, {
          foodId: String(result.food.foodId),
          foodName: result.food.foodName,
          category: result.food.category,
          unhealthyPercentage: result.food.unhealthyPercentage
        });
        setIsSaved(true);
      }
    } catch (e) {
      console.error("Error saving/removing food:", e);
    } finally {
      setSavingFood(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Food overview</div>
              <h2 className="mt-2 text-2xl font-semibold text-ink-900">{result.food.foodName}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip tone="neutral">{result.food.category}</Chip>
                <Chip tone="neutral">{result.food.processingLevel}</Chip>
              </div>
            </div>

            <div className="min-w-[190px] text-right">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Final status</div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <Badge tone={tone}>{result.status}</Badge>
                <div className="text-sm text-gray-600">
                  Dataset: <span className="font-semibold text-ink-900">{result.datasetOverallRecommendation}</span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                Unhealthy: <span className="font-semibold text-ink-900">{result.unhealthyPercentage.toFixed(1)}%</span>
              </div>
              <div className="mt-3">
                <Button 
                  variant={isSaved ? "secondary" : "primary"} 
                  onClick={handleSaveFood}
                  disabled={!session || savingFood}
                >
                  {savingFood ? "Saving..." : (isSaved ? "Remove from Saved" : "Save Food")}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Healthy</div>
              <div className="mt-2 text-2xl font-semibold text-ink-900">{result.food.healthyPercentage.toFixed(1)}%</div>
              <div className="mt-3">
                <ProgressBar value={result.food.healthyPercentage} tone="green" />
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Neutral</div>
              <div className="mt-2 text-2xl font-semibold text-ink-900">{result.food.neutralPercentage.toFixed(1)}%</div>
              <div className="mt-3">
                <ProgressBar value={result.food.neutralPercentage} tone="amber" />
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Unhealthy</div>
              <div className="mt-2 text-2xl font-semibold text-ink-900">{result.food.unhealthyPercentage.toFixed(1)}%</div>
              <div className="mt-3">
                <ProgressBar value={result.food.unhealthyPercentage} tone="rose" />
              </div>
            </div>
          </div>

          {options.riskBreakdown && (
          <Card className="p-6">
            <div className="text-sm font-semibold text-ink-900">Risk Analytics & Breakdown</div>
            <div className="mt-1 text-sm text-gray-600">Detailed analysis of ingredient composition and risk factors.</div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <div className="text-sm font-semibold text-ink-900 mb-4">Ingredient Distribution</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Healthy</span>
                    <span className="text-sm font-semibold text-green-700">{result.food.healthyPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${result.food.healthyPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Neutral</span>
                    <span className="text-sm font-semibold text-amber-700">{result.food.neutralPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-amber-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${result.food.neutralPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Unhealthy</span>
                    <span className="text-sm font-semibold text-red-700">{result.food.unhealthyPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${result.food.unhealthyPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-ink-900 mb-4">Risk Metrics</div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Total Ingredients</div>
                    <div className="text-lg font-bold text-ink-900">{result.ingredients.length}</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Unhealthy Count</div>
                    <div className="text-lg font-bold text-red-700">{result.food.unhealthyIngredientsCount}</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Risk Score</div>
                    <div className="text-lg font-bold text-ink-900">
                      {result.unhealthyPercentage > 60 ? 'High' : 
                       result.unhealthyPercentage > 30 ? 'Medium' : 'Low'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Processing Level</div>
                    <div className="text-lg font-bold text-ink-900">{result.food.processingLevel}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

          <div className="mt-6">
            <div className="text-sm font-semibold text-ink-900">Affected health conditions (dataset)</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.food.affectedHealthConditions.length > 0 ? (
                result.food.affectedHealthConditions.map((c) => (
                  <Chip key={c} tone="neutral">
                    {c}
                  </Chip>
                ))
              ) : (
                <div className="text-sm text-gray-600">No condition tags in dataset.</div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-ink-900">Recommendation summary</div>
            <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-700">
                  Based on unhealthy percentage, unhealthy ingredient count, health-condition overlap, and allergy matches.
                </div>
                <Badge tone={tone}>{result.status} guidance</Badge>
              </div>
              <div className="mt-3 grid gap-2">
                {result.reasons.slice(0, 6).map((r, idx) => (
                  <div key={idx} className="text-sm text-gray-700">
                    - {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Alert
            tone={tone}
            title={result.status === "Safe" ? "Likely suitable" : result.status === "Caution" ? "Use caution" : "May be unsuitable"}
          >
            <div className="text-sm text-gray-800">
              {result.matchedHealthConditions.length > 0 ? (
                <div>
                  Matched conditions:{" "}
                  <span className="font-semibold">{result.matchedHealthConditions.join(", ")}</span>
                </div>
              ) : (
                <div>No direct health-condition overlap found in dataset tags.</div>
              )}
              {result.allergyMatches.length > 0 ? (
                <div className="mt-2">
                  Allergy-related ingredient signals:{" "}
                  <span className="font-semibold">{result.allergyMatches.map((m) => m.token).join(", ")}</span>
                </div>
              ) : (
                <div className="mt-2">No ingredient matches found for your allergy inputs.</div>
              )}
            </div>
          </Alert>

          <Card className="p-6">
            <div className="text-sm font-semibold text-ink-900">Food description</div>
            <div className="mt-2 text-sm leading-relaxed text-gray-700">{result.food.description}</div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Ingredient counts</div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                  <span>Healthy</span>
                  <span className="font-semibold text-ink-900">{result.food.healthyIngredientsCount}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-gray-700">
                  <span>Neutral</span>
                  <span className="font-semibold text-ink-900">{result.food.neutralIngredientsCount}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-gray-700">
                  <span>Unhealthy</span>
                  <span className="font-semibold text-ink-900">{result.food.unhealthyIngredientsCount}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {options.ingredientAnalysis && (
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-ink-900">Ingredient analysis</div>
              <div className="mt-1 text-sm text-gray-600">Search and filter ingredients by name, type, or health concern.</div>
            </div>
            <div className="text-sm text-gray-700">
              Showing: <span className="font-semibold text-ink-900">{filteredIngredients.length}/{result.ingredients.length}</span>
            </div>
          </div>

          <div className="mt-4">
            <Input
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              placeholder="Search ingredients by name, type, or health concern..."
            />
          </div>

          <div className="mt-5 divide-y divide-gray-100">
            {filteredIngredients.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-600">
                No ingredients match your search criteria.
              </div>
            ) : (
              filteredIngredients.map((ing) => {
                const t = ingredientTone(ing.ingredientType);
                const flag = flagByKey.get(`${ing.ingredientOrder}|${ing.ingredientName}`);
                return (
                  <div key={`${ing.ingredientName}-${ing.ingredientOrder}`} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={t}>{ing.ingredientType}</Badge>
                        <div className="font-semibold text-ink-900">
                          {ing.ingredientOrder}. {ing.ingredientName}
                        </div>
                      </div>
                      {ing.healthConcernTag ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Chip tone="neutral">{ing.healthConcernTag}</Chip>
                        </div>
                      ) : null}
                    </div>

                    <div className="sm:max-w-[460px]">
                      {ing.ingredientType === "Unhealthy" && ing.reasonIfUnhealthy ? (
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold text-ink-900">Why unhealthy:</span> {ing.reasonIfUnhealthy}
                        </div>
                      ) : null}
                      {flag?.matchedAllergyToken ? (
                        <div className="mt-2 text-sm">
                          <span className="font-semibold text-rose-700">Allergy signal:</span> token{" "}
                          <span className="font-semibold text-rose-700">{flag.matchedAllergyToken}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

        {options.betterAlternatives && (
        <Card className="p-6">
          <div className="text-sm font-semibold text-ink-900">Better alternatives</div>
          <div className="mt-1 text-sm text-gray-600">Same category, lower unhealthy risk signals.</div>

          <div className="mt-4 grid gap-3">
            {result.betterAlternatives.length > 0 ? (
              result.betterAlternatives.map((f) => {
                // Derive a compact status purely for UI.
                const compactStatus: RiskStatus = f.unhealthyPercentage < 30 ? "Safe" : f.unhealthyPercentage < 60 ? "Caution" : "Avoid";
                return (
                  <Link key={f.foodId} to={`/analysis/${f.foodId}`} className="block">
                    <div className="group rounded-xl border border-gray-100 bg-white p-4 transition hover:shadow-soft">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-ink-900">{f.foodName}</div>
                        <Badge tone={statusTone(compactStatus)}>{compactStatus}</Badge>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">{f.processingLevel}</div>
                      <div className="mt-2 text-sm text-gray-700">
                        Unhealthy: <span className="font-semibold text-ink-900">{f.unhealthyPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={f.unhealthyPercentage} tone="rose" />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-sm text-gray-600">No alternatives found in the same category.</div>
            )}
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}

