import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FoodSearchBar } from "../../components/food/FoodSearchBar";
import { FoodRepository } from "../../features/dataset/repository/FoodRepository";
import { FoodSearchService } from "../../features/dataset/services/foodSearchService";
import { RecommendationFacade } from "../../features/recommendation/facade/recommendationFacade";
import type { FoodDatasetRecord } from "../../features/dataset/types/dataset";
import { defaultUserProfileInput, loadUserProfileInput } from "../../features/user/storage/userProfileStore";
import type { FoodAnalysisResult, RiskStatus, UserProfileInput } from "../../features/recommendation/types/recommendation";
import clsx from "clsx";
import { Badge } from "../../components/ui/Badge";
import { getSession } from "../../features/auth/authStorage";
import { TiltCard } from "../../components/ui/TiltCard";

function statusTone(status: RiskStatus): "green" | "amber" | "rose" {
  if (status === "Safe") return "green";
  if (status === "Caution") return "amber";
  return "rose";
}

export function HomeDashboardPage() {
  const navigate = useNavigate();

  const repo = useMemo(() => new FoodRepository({ mode: "json" }), []);
  const searchService = useMemo(() => new FoodSearchService(repo), [repo]);
  const facade = useMemo(() => new RecommendationFacade(repo), [repo]);

  const session = useMemo(() => getSession(), []);
  const [profile, setProfile] = useState<UserProfileInput>(() => {
    if (!session?.email) return defaultUserProfileInput();
    return loadUserProfileInput(session.email) ?? defaultUserProfileInput();
  });
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState<FoodDatasetRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [widget, setWidget] = useState<FoodAnalysisResult[] | null>(null);
  const [trendingCount, setTrendingCount] = useState(6);
  const [recommendedCount, setRecommendedCount] = useState(6);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const allFoods = await repo.loadAllFoods();
        if (cancelled) return;
        setFoods(allFoods);

        const user = session?.email ? loadUserProfileInput(session.email) ?? defaultUserProfileInput() : defaultUserProfileInput();
        setProfile(user);

        // Personalized widget: analyze a small set of baseline-safe candidates.
        const baseline = [...allFoods].sort((a, b) => a.unhealthyPercentage - b.unhealthyPercentage).slice(0, 12);
        const results: FoodAnalysisResult[] = [];
        for (const f of baseline) {
          const facadeAnalysis = await facade.analyzeFood({ foodId: f.foodId, user, alternativesLimit: 0 });
          if (facadeAnalysis) results.push(facadeAnalysis);
        }
        if (!cancelled) setWidget(results.slice(0, 3));
      } catch {
        if (!cancelled) setWidget(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [repo, facade]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    for (const f of foods) unique.add(f.category);
    return ["All", ...Array.from(unique).sort()];
  }, [foods]);

  const filteredFoods = useMemo(() => {
    if (selectedCategory === "All") return foods;
    return foods.filter((f) => f.category === selectedCategory);
  }, [foods, selectedCategory]);

  const trending = useMemo(() => {
    return [...filteredFoods].sort((a, b) => b.unhealthyIngredientsCount - a.unhealthyIngredientsCount);
  }, [filteredFoods]);

  const recommended = useMemo(() => {
    return [...filteredFoods].sort((a, b) => a.unhealthyPercentage - b.unhealthyPercentage);
  }, [filteredFoods]);

  useEffect(() => {
    setTrendingCount(6);
    setRecommendedCount(6);
  }, [selectedCategory]);

  const insights = useMemo(() => {
    if (foods.length === 0) return null;
    const avgUnhealthy = foods.reduce((acc, f) => acc + f.unhealthyPercentage, 0) / foods.length;
    const avgHealthy = foods.reduce((acc, f) => acc + f.healthyPercentage, 0) / foods.length;
    return { avgUnhealthy, avgHealthy };
  }, [foods]);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-600">Welcome back</div>
            <h1 className="mt-2 text-3xl font-semibold text-ink-900">Your Food Dashboard</h1>
            <p className="mt-3 text-sm text-gray-700">
              Search by name, filter by category, and get ingredient-level risk signals mapped to your selected health conditions and allergies.
            </p>
          </div>
          <div className="lg:w-[480px]">
            <FoodSearchBar
              service={searchService}
              onSelectFoodId={(id) => navigate(`/analysis/${id}`)}
              enableOCR
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <div className="text-sm font-semibold text-ink-900">Category filters</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={clsx(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    c === selectedCategory
                      ? "border-chai-100 bg-chai-50 text-chai-900"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            {insights ? (
              <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-sm font-semibold text-ink-900">Dataset Health Insights</div>
                <div className="mt-2 text-sm text-gray-700">
                  Average unhealthy ingredients across all foods: <span className="font-semibold">{insights.avgUnhealthy.toFixed(1)}%</span>
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  Average healthy ingredients across all foods: <span className="font-semibold">{insights.avgHealthy.toFixed(1)}%</span>
                </div>
                <div className="mt-2 text-xs text-gray-600">These metrics help you understand the overall health distribution in our food database.</div>
              </div>
            ) : null}
          </Card>

          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-ink-900">Personalized Recommendations</div>
                  <div className="mt-1 text-sm text-gray-600">Smart suggestions based on your health profile and dietary preferences.</div>
                </div>
                <Button variant="secondary" onClick={() => navigate("/profile")}>
                  Update profile
                </Button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {loading ? (
                  <div className="text-sm text-gray-600 md:col-span-3">Loading personalized insights...</div>
                ) : widget && widget.length > 0 ? (
                  widget.map((w) => (
                    <button
                      key={w.food.foodId}
                      type="button"
                      onClick={() => navigate(`/analysis/${w.food.foodId}`)}
                      className="group rounded-xl border border-gray-100 bg-white p-4 text-left transition hover:shadow-soft"
                    >
                      <TiltCard className="rounded-xl p-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm font-semibold text-ink-900">{w.food.foodName}</div>
                          <Badge tone={statusTone(w.status)}>{w.status}</Badge>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">{w.food.category}</div>
                        <div className="mt-3 text-sm text-gray-700">
                          Unhealthy: <span className="font-semibold">{w.food.unhealthyPercentage.toFixed(1)}%</span>
                        </div>
                      </TiltCard>
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-gray-600 md:col-span-3">
                    Add profile details to see personalized suggestions.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-ink-900">High Risk Foods</div>
                <div className="mt-1 text-sm text-gray-600">Foods with higher unhealthy ingredient counts - review with caution.</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {trending.slice(0, trendingCount).map((f) => (
                <button
                  key={f.foodId}
                  type="button"
                  onClick={() => navigate(`/analysis/${f.foodId}`)}
                  className="rounded-xl border border-gray-100 bg-white p-4 text-left transition hover:bg-gray-50"
                >
                  <TiltCard className="rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink-900">{f.foodName}</div>
                        <div className="mt-1 text-xs text-gray-600">{f.processingLevel}</div>
                      </div>
                      <Badge tone="rose">{f.unhealthyIngredientsCount} unhealthy</Badge>
                    </div>
                    <div className="mt-3 text-sm text-gray-700">
                      Unhealthy percentage: <span className="font-semibold">{f.unhealthyPercentage.toFixed(1)}%</span>
                    </div>
                  </TiltCard>
                </button>
              ))}
              {trending.length === 0 ? <div className="text-sm text-gray-600">No foods found.</div> : null}
            </div>

            {trending.length > trendingCount ? (
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" onClick={() => setTrendingCount((v) => v + 6)}>
                  Load more
                </Button>
              </div>
            ) : null}
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold text-ink-900">Healthier Choices</div>
            <div className="mt-1 text-sm text-gray-600">Recommended foods with lower unhealthy percentages in your selected category.</div>

            <div className="mt-4 grid gap-3">
              {recommended.slice(0, recommendedCount).map((f) => (
                <button
                  key={f.foodId}
                  type="button"
                  onClick={() => navigate(`/analysis/${f.foodId}`)}
                  className="rounded-xl border border-gray-100 bg-white p-4 text-left transition hover:bg-gray-50"
                >
                  <TiltCard className="rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink-900">{f.foodName}</div>
                        <div className="mt-1 text-xs text-gray-600">{f.category}</div>
                      </div>
                      <Badge tone="green">{f.unhealthyPercentage.toFixed(1)}%</Badge>
                    </div>
                    <div className="mt-3 text-sm text-gray-700">
                      Unhealthy ingredients: <span className="font-semibold">{f.unhealthyIngredientsCount}</span>
                    </div>
                  </TiltCard>
                </button>
              ))}
              {recommended.length === 0 ? <div className="text-sm text-gray-600">No foods found.</div> : null}
            </div>

            {recommended.length > recommendedCount ? (
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" onClick={() => setRecommendedCount((v) => v + 6)}>
                  Load more
                </Button>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

