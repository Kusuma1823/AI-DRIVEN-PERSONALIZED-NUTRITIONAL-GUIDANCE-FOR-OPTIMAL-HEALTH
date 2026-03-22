import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Chip } from "../../components/ui/Chip";
import { TiltCard } from "../../components/ui/TiltCard";
import { FoodSearchBar } from "../../components/food/FoodSearchBar";
import { FoodRepository } from "../../features/dataset/repository/FoodRepository";
import { FoodSearchService } from "../../features/dataset/services/foodSearchService";
import type { FoodDatasetRecord } from "../../features/dataset/types/dataset";
import clsx from "clsx";

function riskTone(unhealthyPct: number): "green" | "amber" | "rose" {
  if (unhealthyPct < 30) return "green";
  if (unhealthyPct < 60) return "amber";
  return "rose";
}

export function FoodRecommendationPage() {
  const navigate = useNavigate();

  const repo = useMemo(() => new FoodRepository({ mode: "json" }), []);
  const searchService = useMemo(() => new FoodSearchService(repo), [repo]);

  const [foods, setFoods] = useState<FoodDatasetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState<number>(24);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const f of foods) set.add(f.category);
    return ["All", ...Array.from(set).sort()];
  }, [foods]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const all = await repo.loadAllFoods();
        if (cancelled) return;
        setFoods(all);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  useEffect(() => {
    // Reset pagination when the category changes.
    setVisibleCount(24);
  }, [category]);

  const filtered = useMemo(() => {
    if (category === "All") return foods;
    return foods.filter((f) => f.category === category);
  }, [foods, category]);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-600">Explore processed foods</div>
            <h1 className="mt-2 text-3xl font-semibold text-ink-900">Food recommendation browser</h1>
            <p className="mt-3 text-sm text-gray-700">Search by name, filter by category, and open a full ingredient risk analysis.</p>
          </div>
          <div className="w-full lg:w-[520px]">
            <FoodSearchBar service={searchService} onSelectFoodId={(id) => navigate(`/analysis/${id}`)} enableOCR />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <div className="text-sm font-semibold text-ink-900">Filter panel</div>
            <div className="mt-2 text-sm text-gray-600">Refine by dataset category.</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={clsx(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    c === category ? "border-chai-100 bg-chai-50 text-chai-900" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">How recommendations work</div>
              <div className="mt-2 text-sm text-gray-700">
                Risk is driven by `unhealthy_percentage`, count of unhealthy ingredients, health-condition overlaps, and allergy token matches.
              </div>
            </div>

            <div className="mt-6">
              <Button variant="secondary" onClick={() => navigate("/profile")}>
                Update health profile
              </Button>
            </div>
          </Card>

          <div className="grid gap-4">
            <div className="text-sm text-gray-600">{loading ? "Loading foods..." : `Showing ${filtered.length} item(s).`}</div>

            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.slice(0, visibleCount).map((f) => (
                  <button
                    key={f.foodId}
                    type="button"
                    onClick={() => navigate(`/analysis/${f.foodId}`)}
                    className="text-left"
                  >
                    <TiltCard className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-ink-900 truncate">{f.foodName}</div>
                          <div className="mt-1 text-xs text-gray-600">{f.processingLevel}</div>
                        </div>
                        <Badge tone={riskTone(f.unhealthyPercentage)}>{f.unhealthyPercentage.toFixed(1)}%</Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Chip tone="neutral">{f.category}</Chip>
                        {f.unhealthyIngredientsCount > 0 ? (
                          <Chip tone="rose">{f.unhealthyIngredientsCount} unhealthy</Chip>
                        ) : (
                          <Chip tone="green">No unhealthy flagged</Chip>
                        )}
                      </div>

                      <div className="mt-4 text-sm text-gray-700">
                        Healthy: <span className="font-semibold">{f.healthyPercentage.toFixed(1)}%</span>
                        <span className="text-gray-400"> · </span>
                        Neutral: <span className="font-semibold">{f.neutralPercentage.toFixed(1)}%</span>
                      </div>
                    </TiltCard>
                  </button>
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <div className="text-sm font-semibold text-ink-900">No items found</div>
                <div className="mt-2 text-sm text-gray-700">Try a different category filter.</div>
              </Card>
            )}

            {filtered.length > visibleCount ? (
              <div className="flex justify-center">
                <Button variant="secondary" onClick={() => setVisibleCount((v) => v + 12)}>
                  Load more
                </Button>
              </div>
            ) : null}

            {/* Note removed to keep the browser UI clean and dashboard-like */}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

