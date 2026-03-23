import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { defaultUserProfileInput, loadUserProfileInput } from "../../features/user/storage/userProfileStore";
import { FoodRepository } from "../../features/dataset/repository/FoodRepository";
import { RecommendationFacade } from "../../features/recommendation/facade/recommendationFacade";
import type { FoodAnalysisResult } from "../../features/recommendation/types/recommendation";
import { RecommendationAnalysisDashboard } from "../../features/recommendation/ui/RecommendationAnalysisDashboard";
import { getSession } from "../../features/auth/authStorage";
import { Checkbox } from "../../components/ui/Checkbox";
import type { AnalysisDisplayOptions } from "../../features/recommendation/types/recommendation";

export function RecommendationAnalysisPage() {
  const params = useParams();
  const foodIdRaw = params.foodId;
  const foodId = Number(foodIdRaw);

  const repo = useMemo(() => new FoodRepository({ mode: "json" }), []);
  const facade = useMemo(() => new RecommendationFacade(repo), [repo]);

  // Load user profile - will trigger re-analysis when it changes
  const session = useMemo(() => getSession(), []);
  const userProfile = useMemo(() => {
    return session?.email ? loadUserProfileInput(session.email) ?? defaultUserProfileInput() : defaultUserProfileInput();
  }, [session?.email]);

  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [options, setOptions] = useState<AnalysisDisplayOptions>({
    overview: true,
    riskBreakdown: true,
    ingredientAnalysis: true,
    personalizedWarning: true,
    betterAlternatives: true,
  });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        setResult(null);

        if (!Number.isFinite(foodId)) {
          throw new Error("Invalid food id in URL.");
        }

        const analysis = await facade.analyzeFood({
          foodId,
          user: userProfile,
          alternativesLimit: 4,
        });

        if (!cancelled) setResult(analysis);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load analysis.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [foodId, facade, userProfile]);

  return (
    <PageShell>
      {loading ? (
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Card className="p-6">
            <div className="text-sm font-semibold text-gray-600">Loading analysis</div>
            <div className="mt-2 text-sm text-gray-700">Fetching dataset and computing rule-based risk signals...</div>
          </Card>
        </div>
      ) : error ? (
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Card className="p-6">
            <div className="text-sm font-semibold text-rose-700">Something went wrong</div>
            <div className="mt-2 text-sm text-gray-700">{error}</div>
          </Card>
        </div>
      ) : result ? (
        <>
          <div className="mx-auto max-w-6xl px-4 pt-6">
            <Card className="p-5">
              <div className="text-sm font-semibold text-ink-900">Pick what you want to see</div>
              <div className="mt-1 text-sm text-gray-600">
                Select sections to tailor the analysis dashboard for your needs.
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Checkbox
                  checked={options.overview}
                  onChange={(next) => setOptions((o) => ({ ...o, overview: next }))}
                  label="Food overview"
                  description="Category, processing level, and unhealthy %. "
                />
                <Checkbox
                  checked={options.riskBreakdown}
                  onChange={(next) => setOptions((o) => ({ ...o, riskBreakdown: next }))}
                  label="Risk breakdown graphs"
                  description="Healthy/neutral/unhealthy bars + risk score."
                />
                <Checkbox
                  checked={options.ingredientAnalysis}
                  onChange={(next) => setOptions((o) => ({ ...o, ingredientAnalysis: next }))}
                  label="Ingredient analysis"
                  description="Search within ingredients and view reasons/tags."
                />
                <Checkbox
                  checked={options.personalizedWarning}
                  onChange={(next) => setOptions((o) => ({ ...o, personalizedWarning: next }))}
                  label="Personalized warning"
                  description="Matched health conditions + allergy signals + BMI note."
                />
                <Checkbox
                  checked={options.betterAlternatives}
                  onChange={(next) => setOptions((o) => ({ ...o, betterAlternatives: next }))}
                  label="Better alternatives"
                  description="Same category with lower unhealthy risk."
                />
              </div>
            </Card>
          </div>
          <RecommendationAnalysisDashboard result={result} options={options} />
        </>
      ) : (
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Card className="p-6">
            <div className="text-sm font-semibold text-gray-600">No analysis found</div>
            <div className="mt-2 text-sm text-gray-700">Try selecting a different food.</div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}

