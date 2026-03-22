import React from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LeafCartoon } from "../../components/graphics/LeafCartoon";

export function LandingPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:pt-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm text-emerald-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
              Food-tech recommendations with ingredient-level risk signals
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink-900 md:text-5xl">
              Find foods that fit your health goals.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-700 md:text-lg">
              Search foods, explore ingredient analysis, and get personalized Safe/Caution/Avoid guidance based on your selected health conditions and allergies.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/analysis/1" className="sm:w-auto">
                <Button>Try a sample analysis</Button>
              </Link>
              <Link to="/analysis/2" className="sm:w-auto">
                <Button variant="secondary">Explore another example</Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <Card className="p-4">
                <div className="text-sm font-medium text-ink-900">Ingredient-level visibility</div>
                <div className="mt-1 text-sm text-gray-700">See every ingredient with type, concern tag, and notes.</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm font-medium text-ink-900">Health-aware ranking</div>
                <div className="mt-1 text-sm text-gray-700">Risk scoring considers unhealthy %, health overlaps, and allergy matches.</div>
              </Card>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-brandGreen-200/50 via-softOrange-200/40 to-white blur-2xl" />
            <Card className="relative overflow-hidden border border-gray-100 bg-white/80 shadow-soft">
              <div className="p-6">
                <div className="shimmer-line rounded-2xl border border-gray-100 bg-gradient-to-r from-white via-brandGreen-50 to-white px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-ink-900">3D-cartoon risk insights</div>
                    <div className="floaty">
                      <LeafCartoon className="drop-shadow-[0_20px_30px_rgba(18,166,91,0.18)]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Personalized dashboard preview</div>
                    <div className="mt-2 text-xl font-semibold text-ink-900">Analysis that reads like a product</div>
                    <div className="mt-1 text-sm text-gray-700">Premium cards, visual risk indicators, and clear explanations.</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-brandGreen-800 shadow-sm">
                    Health-Tech UI
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="text-sm font-medium text-ink-900">Risk indicators</div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 w-[65%] rounded-full bg-brandGreen-500/80" />
                    </div>
                    <div className="mt-2 text-sm text-gray-600">Healthy / Neutral / Unhealthy breakdown</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="text-sm font-medium text-ink-900">Ingredient flags</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">Healthy</span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">Neutral</span>
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">Unhealthy</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">Reasons and concern tags shown clearly</div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-700">
                  Built around your dataset fields: <span className="font-medium">unhealthy_percentage</span>, ingredient types, <span className="font-medium">affected_health_conditions</span>, and allergy matches.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

