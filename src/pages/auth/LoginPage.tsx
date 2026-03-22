import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { signIn } from "../../features/auth/authStorage";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!email.trim()) return "Email is required.";
    if (!password.trim()) return "Password is required.";
    if (password.length < 4) return "Password must be at least 4 characters.";
    return null;
  }

  async function submit() {
    setSubmitting(true);
    try {
      setError(null);
      const v = validate();
      if (v) {
        setError(v);
        return;
      }

      const res = await signIn({ email, password });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      navigate("/home");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <h1 className="text-4xl font-bold text-ink-900">Welcome Back</h1>
            <p className="mt-6 text-lg italic text-gray-700">"Eating well is a form of self-respect." - Unknown</p>
            <p className="mt-4 text-sm text-gray-600">Sign in to access personalized food recommendations tailored to your health goals.</p>
          </div>

          <Card className="p-8 shadow-lg">
            <div className="text-lg font-bold text-ink-900">Sign In</div>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
              {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
              <Button type="submit" disabled={submitting} className="w-full py-3 text-base font-semibold">
                {submitting ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-sm text-gray-600">
                New here?{" "}
                <Link className="font-semibold text-chai-100 hover:underline" to="/signup">
                  Create an account
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

