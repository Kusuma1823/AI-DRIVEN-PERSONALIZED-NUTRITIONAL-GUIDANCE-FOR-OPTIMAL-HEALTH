import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { dbClient } from "../../lib/database/dbClient";
import { getSession } from "../../features/auth/authStorage";

export function ContactUsPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!name.trim()) return "Name is required.";
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
    if (!subject.trim()) return "Subject is required.";
    if (!message.trim()) return "Message is required.";
    if (message.trim().length < 10) return "Message should be at least 10 characters.";
    return null;
  }

  async function submit() {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const contactData = {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      };
      
      const result = await dbClient.contact.save(contactData);
      if (!result) {
        throw new Error('Failed to save contact');
      }
      
      await new Promise((r) => setTimeout(r, 500));
      setSubmitted(true);
      
      // Redirect to admin page after 2 seconds if admin is logged in
      if (session && session.userId === 'admin') {
        setTimeout(() => navigate('/admin'), 2000);
      }
    } catch (e) {
      console.error('Error submitting contact:', e);
      setError('Failed to submit contact form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-600">Contact support</div>
            <h1 className="mt-2 text-3xl font-semibold text-ink-900">We’re here to help</h1>
            <p className="mt-3 text-sm text-gray-700">Send us your questions, feedback, or support requests.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="text-sm font-semibold text-ink-900">Support Team</div>
            <div className="mt-2 text-sm text-gray-700">
              Name: <span className="font-semibold">Shanmukh</span>
              <br />
              Email: <span className="font-semibold">shanmukh.dhanush21@gmail.com</span>
              <br />
              Office: <span className="font-semibold">Vel Tech</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">LinkedIn</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">X</a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">Instagram</a>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="p-6">
            <div className="text-sm font-semibold text-ink-900">Contact form</div>
            {submitted ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Message submitted successfully. We’ll get back to you soon.
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>

                <div className="mt-4">
                  <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" />
                </div>

                <div className="mt-4">
                  <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message..." />
                </div>

                {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}

                <div className="mt-6">
                  <Button onClick={submit} disabled={submitting}>
                    {submitting ? "Sending..." : "Send message"}
                  </Button>
                </div>
              </>
            )}
          </Card>

          <div className="grid gap-6">
            <Card className="p-6">
              <div className="text-sm font-semibold text-ink-900">Health Resources</div>
              <div className="mt-2 text-sm text-gray-700">Trusted sources for nutrition and health information.</div>
              
              <div className="mt-4 space-y-3">
                <a href="https://www.who.int/health-topics/healthy-diet" target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-gray-100 bg-white p-4 hover:bg-gray-50 transition">
                  <div className="text-sm font-semibold text-chai-100">WHO Healthy Diet Guidelines</div>
                  <div className="mt-1 text-xs text-gray-600">Global recommendations for healthy eating patterns</div>
                </a>
                <a href="https://www.fda.gov/food/food-labeling-nutrition" target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-gray-100 bg-white p-4 hover:bg-gray-50 transition">
                  <div className="text-sm font-semibold text-chai-100">FDA Food Labeling Guide</div>
                  <div className="mt-1 text-xs text-gray-600">Understanding nutrition facts and ingredient labels</div>
                </a>
                <a href="https://www.choosemyplate.gov/" target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-gray-100 bg-white p-4 hover:bg-gray-50 transition">
                  <div className="text-sm font-semibold text-chai-100">MyPlate Nutrition Guide</div>
                  <div className="mt-1 text-xs text-gray-600">Balanced eating guidelines and meal planning</div>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

