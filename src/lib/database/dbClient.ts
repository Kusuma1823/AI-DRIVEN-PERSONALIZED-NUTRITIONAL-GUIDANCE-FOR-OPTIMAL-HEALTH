/**
 * Database client for communicating with backend API
 * All data is persisted to SQLite database instead of localStorage
 */

const API_BASE = 'http://localhost:5000/api/db';

export const dbClient = {
  // ============================================================================
  // Authentication
  // ============================================================================
  
  auth: {
    signup: async (name: string, email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    },

    signin: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    },

    getAllUsers: async () => {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      return data.users || [];
    },
  },

  // ============================================================================
  // User Profiles
  // ============================================================================
  
  profile: {
    save: async (email: string, profile: any) => {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...profile }),
      });
      return res.ok;
    },

    get: async (email: string) => {
      const res = await fetch(`${API_BASE}/profile/${email}`);
      const data = await res.json();
      return data.profile;
    },
  },

  // ============================================================================
  // Saved Foods
  // ============================================================================
  
  savedFoods: {
    save: async (userId: string, food: any) => {
      const res = await fetch(`${API_BASE}/saved-foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...food }),
      });
      return res.ok;
    },

    getAll: async (userId: string) => {
      const res = await fetch(`${API_BASE}/saved-foods/${userId}`);
      const data = await res.json();
      return data.savedFoods || [];
    },

    remove: async (foodId: string) => {
      const res = await fetch(`${API_BASE}/saved-foods/${foodId}`, {
        method: 'DELETE',
      });
      return res.ok;
    },
  },

  // ============================================================================
  // Feedback
  // ============================================================================
  
  feedback: {
    save: async (feedback: any) => {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      return res.ok;
    },

    getAll: async () => {
      const res = await fetch(`${API_BASE}/feedback`);
      const data = await res.json();
      return data.feedback || [];
    },
  },

  // ============================================================================
  // Community
  // ============================================================================
  
  community: {
    save: async (post: any) => {
      const res = await fetch(`${API_BASE}/community`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      return res.ok;
    },

    getAll: async () => {
      const res = await fetch(`${API_BASE}/community`);
      const data = await res.json();
      return data.posts || [];
    },

    getByUser: async (email: string) => {
      const res = await fetch(`${API_BASE}/community/${email}`);
      const data = await res.json();
      return data.posts || [];
    },
  },

  // ============================================================================
  // Contact
  // ============================================================================
  
  contact: {
    save: async (contact: any) => {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      return res.ok;
    },

    getAll: async () => {
      const res = await fetch(`${API_BASE}/contact`);
      const data = await res.json();
      return data.submissions || [];
    },

    getByUser: async (email: string) => {
      const res = await fetch(`${API_BASE}/contact/${email}`);
      const data = await res.json();
      return data.submissions || [];
    },
  },
};
