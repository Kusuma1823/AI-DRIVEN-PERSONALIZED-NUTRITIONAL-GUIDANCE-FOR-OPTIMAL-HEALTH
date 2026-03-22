import { dbClient } from "../../lib/database/dbClient";

const API_BASE = 'http://localhost:5000/api/db';

export type CommunityPost = {
  id: string;
  authorName: string;
  authorEmail: string;
  caption: string;
  imageDataUrl?: string;
  createdAt: number;
  likes: number;
  likedByEmails: string[];
  comments: Array<{
    id: string;
    authorName: string;
    authorEmail: string;
    text: string;
    createdAt: number;
  }>;
};

export async function loadCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const posts = await dbClient.community.getAll();
    if (!Array.isArray(posts)) return [];
    return posts.map((p: any) => ({
      id: p.id,
      authorName: p.authorEmail?.split('@')[0] || "User",
      authorEmail: p.authorEmail,
      caption: p.caption,
      imageDataUrl: p.imageDataUrl,
      createdAt: p.createdAt || Date.now(),
      likes: p.likes || 0,
      likedByEmails: [],
      comments: p.comments || [],
    }));
  } catch (e) {
    console.error('Error loading community posts:', e);
    return [];
  }
}

export async function saveCommunityPosts(posts: CommunityPost[]): Promise<void> {
  // Not used with database approach
}

export async function addCommunityPost(params: {
  authorName: string;
  authorEmail: string;
  caption: string;
  imageDataUrl?: string;
}): Promise<CommunityPost | null> {
  try {
    const result = await dbClient.community.save({
      authorEmail: params.authorEmail,
      caption: params.caption,
      imageDataUrl: params.imageDataUrl,
    });
    
    if (result) {
      return {
        id: String(Date.now()),
        authorName: params.authorName,
        authorEmail: params.authorEmail,
        caption: params.caption,
        imageDataUrl: params.imageDataUrl,
        createdAt: Date.now(),
        likes: 0,
        likedByEmails: [],
        comments: [],
      };
    }
    return null;
  } catch (e) {
    console.error('Error adding community post:', e);
    throw e;
  }
}

export async function toggleLike(postId: string, user: { email: string; name: string }): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/community/${postId}/like`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: user.email, userName: user.name }),
    });
    if (!res.ok) {
      throw new Error('Failed to toggle like');
    }
  } catch (e) {
    console.error('Error toggling like:', e);
    throw e;
  }
}

export async function addComment(params: { postId: string; user: { email: string; name: string }; text: string }): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/community/${params.postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userEmail: params.user.email, 
        userName: params.user.name, 
        text: params.text 
      }),
    });
    if (!res.ok) {
      throw new Error('Failed to add comment');
    }
  } catch (e) {
    console.error('Error adding comment:', e);
    throw e;
  }
}

