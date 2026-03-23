/**
 * Database client for communicating with backend API
 * All data is persisted to SQLite database instead of localStorage
 */

// Get API URL at runtime (works in both dev and prod)
function getAPIBase(): string {
  // Check for environment variable first
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return `${envUrl}/api/db`;
  }
  
  // Development: use relative path to leverage Vite's proxy
  if (import.meta.env.DEV) {
    return '/api/db';
  }
  
  // Production fallback - derive from current domain
  // Assumes backend is on same root domain or specified via env
  return '/api/db';
}

const API_BASE = getAPIBase();
console.log('[dbClient] API Base URL:', API_BASE);

export const dbClient = {
  // ============================================================================
  // Authentication
  // ============================================================================
  
  auth: {
    signup: async (name: string, email: string, password: string) => {
      try {
        console.log(`[dbClient.signup] POST to ${API_BASE}/auth/signup`);
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        console.log(`[dbClient.signup] Response:`, { ok: res.ok, data });
        return { ok: res.ok, data };
      } catch (error) {
        console.error(`[dbClient.signup] Error:`, error);
        throw error;
      }
    },

    signin: async (email: string, password: string) => {
      try {
        console.log(`[dbClient.signin] POST to ${API_BASE}/auth/signin`);
        const res = await fetch(`${API_BASE}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        console.log(`[dbClient.signin] Response:`, { ok: res.ok, data });
        return { ok: res.ok, data };
      } catch (error) {
        console.error(`[dbClient.signin] Error:`, error);
        throw error;
      }
    },

    getAllUsers: async () => {
      try {
        const res = await fetch(`${API_BASE}/users`);
        const data = await res.json();
        return data.users || [];
      } catch (error) {
        console.error(`[dbClient.getAllUsers] Error:`, error);
        return [];
      }
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
      try {
        console.log('[dbClient.community.save] POST to /api/db/community');
        const res = await fetch(`${API_BASE}/community`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post),
        });
        const data = await res.json();
        console.log('[dbClient.community.save] Response:', { ok: res.ok, data });
        return res.ok;
      } catch (error) {
        console.error('[dbClient.community.save] Error:', error);
        throw error;
      }
    },

    getAll: async () => {
      try {
        console.log('[dbClient.community.getAll] GET /api/db/community');
        const res = await fetch(`${API_BASE}/community`);
        const data = await res.json();
        console.log('[dbClient.community.getAll] Response:', data);
        return data.posts || [];
      } catch (error) {
        console.error('[dbClient.community.getAll] Error:', error);
        return [];
      }
    },

    getByUser: async (email: string) => {
      try {
        const res = await fetch(`${API_BASE}/community/${email}`);
        const data = await res.json();
        return data.posts || [];
      } catch (error) {
        console.error('[dbClient.community.getByUser] Error:', error);
        return [];
      }
    },

    toggleLike: async (postId: string, userEmail: string) => {
      try {
        console.log(`[dbClient.community.toggleLike] PUT /api/db/community/${postId}/like`);
        const res = await fetch(`${API_BASE}/community/${postId}/like`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail }),
        });
        const data = await res.json();
        console.log(`[dbClient.community.toggleLike] Response:`, { ok: res.ok, data });
        if (!res.ok) {
          throw new Error(data.error || 'Failed to toggle like');
        }
        return data;
      } catch (error) {
        console.error(`[dbClient.community.toggleLike] Error:`, error);
        throw error;
      }
    },

    addComment: async (postId: string, comment: { userEmail: string; userName: string; text: string }) => {
      try {
        console.log(`[dbClient.community.addComment] POST /api/db/community/${postId}/comment`);
        const res = await fetch(`${API_BASE}/community/${postId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comment),
        });
        const data = await res.json();
        console.log(`[dbClient.community.addComment] Response:`, { ok: res.ok, data });
        if (!res.ok) {
          throw new Error(data.error || 'Failed to add comment');
        }
        return data;
      } catch (error) {
        console.error(`[dbClient.community.addComment] Error:`, error);
        throw error;
      }
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
