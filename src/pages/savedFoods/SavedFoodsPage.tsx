import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { getSession } from "../../features/auth/authStorage";
import { getSavedFoods, removeSavedFood, type SavedFood } from "../../features/savedFoods/savedFoodsStorage";

export function SavedFoodsPage() {
  const navigate = useNavigate();
  const session = useMemo(() => getSession(), []);
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedFoods() {
      if (!session) {
        setLoading(false);
        return;
      }
      try {
        const foods = await getSavedFoods(session.userId);
        if (Array.isArray(foods)) {
          setSavedFoods(foods);
        } else {
          setSavedFoods([]);
        }
      } catch (e) {
        console.error("Error loading saved foods:", e);
        setSavedFoods([]);
      } finally {
        setLoading(false);
      }
    }
    loadSavedFoods();
  }, [session]);

  const handleRemoveFood = async (savedFoodId: string) => {
    if (!session) return;
    setRemoving(savedFoodId);
    try {
      await removeSavedFood(session.userId, savedFoodId);
      setSavedFoods(prev => prev.filter(f => f.id !== savedFoodId));
    } catch (e) {
      console.error("Error removing food:", e);
    } finally {
      setRemoving(null);
    }
  };

  const handleAnalyzeFood = (foodId: string) => {
    navigate(`/analysis/${foodId}`);
  };

  if (!session) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-14">
          <Card className="p-6 text-center">
            <div className="text-lg font-semibold text-ink-900">Please Sign In</div>
            <div className="mt-2 text-sm text-gray-700">
              You need to be logged in to view your saved foods.
            </div>
            <Button className="mt-4" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </Card>
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-14">
          <Card className="p-6 text-center">
            <div className="text-lg font-semibold text-ink-900">Loading Saved Foods...</div>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink-900">Saved Foods</h1>
          <p className="mt-2 text-sm text-gray-700">
            Your personal collection of analyzed foods for quick reference.
          </p>
        </div>

        {savedFoods.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-lg font-semibold text-ink-900">No Saved Foods</div>
            <div className="mt-2 text-sm text-gray-700">
              Start analyzing foods and save your favorites for quick access.
            </div>
            <Button className="mt-4" onClick={() => navigate("/analysis/1")}>
              Browse Foods
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {savedFoods.map((food) => (
              <Card key={food.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-ink-900">{food.foodName}</h3>
                      <Badge tone="neutral">{food.category}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      Saved on {new Date(food.savedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Unhealthy</div>
                      <div className="text-lg font-bold text-ink-900">
                        {food.unhealthyPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => handleAnalyzeFood(food.foodId)}
                  >
                    View Analysis
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleRemoveFood(food.id)}
                    disabled={removing === food.id}
                  >
                    {removing === food.id ? "Removing..." : "Remove"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
