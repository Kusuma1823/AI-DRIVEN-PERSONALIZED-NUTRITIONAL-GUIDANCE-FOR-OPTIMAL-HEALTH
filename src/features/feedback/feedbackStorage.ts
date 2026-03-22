import { dbClient } from "../../lib/database/dbClient";

export type FeedbackTicket = {
  id: string;
  category: string;
  subject: string;
  description: string;
  contactName: string;
  contactEmail: string;
  proofDataUrl?: string;
  createdAt: number;
  status: "Received" | "In Review" | "Resolved";
};

const KEY = "efood.feedback.tickets";

export async function loadFeedbackTickets(): Promise<FeedbackTicket[]> {
  try {
    return await dbClient.feedback.getAll();
  } catch {
    return [];
  }
}

export async function saveFeedbackTicket(ticket: FeedbackTicket): Promise<void> {
  try {
    const toSave = {
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      contactName: ticket.contactName,
      contactEmail: ticket.contactEmail,
      proofDataUrl: ticket.proofDataUrl,
    };
    await dbClient.feedback.save(toSave);
  } catch (e) {
    console.error("Error saving feedback:", e);
  }
}

