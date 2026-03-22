import { dbClient } from "../../lib/database/dbClient";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string; // prototype-only; do not use in production
  created_at?: number;
};

type Session = {
  userId: string;
  email: string;
  name: string;
  createdAt: number;
};

const SESSION_KEY = "efood.session";

export async function getAllUsers(): Promise<AuthUser[]> {
  try {
    return await dbClient.auth.getAllUsers();
  } catch {
    return [];
  }
}

export async function signUp(params: { name: string; email: string; password: string }): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const emailKey = params.email.trim().toLowerCase();
    if (!emailKey) return { ok: false, message: "Email is required." };
    
    const result = await dbClient.auth.signup(
      params.name.trim() || "User",
      emailKey,
      params.password
    );
    
    if (result.ok) {
      return { ok: true };
    } else {
      return { ok: false, message: result.data?.error || "Registration failed." };
    }
  } catch (error) {
    return { ok: false, message: "Registration error. Please try again." };
  }
}

export async function signIn(params: { email: string; password: string }): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    // Check for admin credentials first
    if (params.email === "admin@gmail.com" && params.password === "1234") {
      const adminSession: Session = {
        userId: "admin",
        email: "admin@gmail.com", 
        name: "Admin",
        createdAt: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminSession));
      return { ok: true };
    }

    const emailKey = params.email.trim().toLowerCase();
    const result = await dbClient.auth.signin(emailKey, params.password);
    
    if (result.ok && result.data.userId) {
      const session: Session = {
        userId: result.data.userId,
        email: emailKey,
        name: params.email, // We'll get the actual name from user record when needed
        createdAt: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { ok: true };
    } else {
      return { ok: false, message: result.data?.error || "Invalid email or password." };
    }
  } catch (error) {
    return { ok: false, message: "Sign in error. Please try again." };
  }
}

export function getSession(): { userId: string; email: string; name: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.userId || !parsed.email) return null;
    return { userId: parsed.userId, email: parsed.email, name: parsed.name };
  } catch {
    return null;
  }
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

