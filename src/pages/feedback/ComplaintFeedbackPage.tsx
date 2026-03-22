import React, { useEffect, useState } from "react";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Chip } from "../../components/ui/Chip";
import { Badge } from "../../components/ui/Badge";
import type { FeedbackTicket } from "../../features/feedback/feedbackStorage";
import { loadFeedbackTickets, saveFeedbackTicket } from "../../features/feedback/feedbackStorage";

const CATEGORIES: string[] = ["Complaint", "Bug Report", "Harmful Food Report", "General Feedback"];

export function ComplaintFeedbackPage() {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [proofDataUrl, setProofDataUrl] = useState<string | undefined>(undefined);

  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const loadedTickets = await loadFeedbackTickets();
        setTickets(loadedTickets);
      } catch (e) {
        console.error("Error loading feedback tickets:", e);
        setTickets([]);
      }
    }
    load();
  }, []);

  async function onPickProof(file: File | null) {
    if (!file) {
      setProofDataUrl(undefined);
      return;
    }
    const reader = new FileReader();
    const dataUrl: string = await new Promise((resolve, reject) => {
      reader.onerror = () => reject(new Error("Proof read failed"));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
    setProofDataUrl(dataUrl);
  }

  function validate() {
    if (!category) return "Category is required.";
    if (!subject.trim()) return "Subject is required.";
    if (!description.trim()) return "Description is required.";
    if (description.trim().length < 10) return "Description should be at least 10 characters.";
    if (!contactName.trim()) return "Contact name is required.";
    if (!contactEmail.trim()) return "Contact email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) return "Enter a valid contact email.";
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
      const ticket: FeedbackTicket = {
        id: String(Date.now()),
        category,
        subject: subject.trim(),
        description: description.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        proofDataUrl,
        createdAt: Date.now(),
        status: "Received",
      };
      await saveFeedbackTicket(ticket);
      const updatedTickets = await loadFeedbackTickets();
      setTickets(updatedTickets);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setSubject("");
      setDescription("");
      setProofDataUrl(undefined);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-600">Feedback & safety reports</div>
            <h1 className="mt-2 text-3xl font-semibold text-ink-900">Submit a ticket</h1>
            <p className="mt-3 text-sm text-gray-700">Report bugs, share feedback, or submit concerns about harmful foods (prototype UI).</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="text-sm font-semibold text-ink-900">What happens next</div>
            <div className="mt-2 text-sm text-gray-700">Your ticket is stored locally and marked as “Received”. Status tracking is prototype-ready.</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone="neutral">Validation-ready forms</Chip>
              <Chip tone="neutral">Optional proof upload</Chip>
              <Chip tone="neutral">Status UI placeholder</Chip>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="p-6">
            <div className="text-sm font-semibold text-ink-900">Complaint / feedback form</div>

            {submitted ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Ticket submitted successfully. Thanks for helping improve the platform.
              </div>
            ) : null}

            <div className="mt-4 space-y-4">
              <Select
                label="Category"
                value={category}
                onChange={setCategory}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              />

              <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary of your issue" />

              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details that help us understand the issue..."
              />

              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <Input label="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name" />
                <Input label="Contact email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="you@example.com" />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700">Upload proof (optional)</div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => onPickProof(e.target.files?.[0] ?? null)}
                  className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm"
                />
                {proofDataUrl ? <div className="text-xs text-gray-600">Proof uploaded.</div> : null}
              </div>

              {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}

              <div className="pt-2">
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit ticket"}
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="p-6">
              <div className="text-sm font-semibold text-ink-900">Status tracking (prototype)</div>
              <div className="mt-2 text-sm text-gray-600">Tickets you submitted locally will show up here.</div>

              <div className="mt-4 space-y-3">
                {tickets.length === 0 ? (
                  <div className="text-sm text-gray-600">No tickets yet.</div>
                ) : (
                  tickets.slice(0, 6).map((t) => (
                    <div key={t.id} className="rounded-xl border border-gray-100 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-ink-900 truncate">{t.subject}</div>
                          <div className="mt-1 text-xs text-gray-600">{t.category}</div>
                        </div>
                        <Badge tone={t.status === "Resolved" ? "green" : t.status === "In Review" ? "amber" : "neutral"}>{t.status}</Badge>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Submitted: {new Date(t.createdAt).toLocaleDateString()}.
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

