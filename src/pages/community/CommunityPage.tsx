import React, { useEffect, useMemo, useState } from "react";
import { PageShell } from "../../components/layout/PageShell";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Chip } from "../../components/ui/Chip";
import { Badge } from "../../components/ui/Badge";
import { TiltCard } from "../../components/ui/TiltCard";
import { Modal } from "../../components/ui/Modal";
import { loadCommunityPosts, addCommunityPost, toggleLike, addComment, type CommunityPost } from "../../features/community/communityStorage";
import { getSession } from "../../features/auth/authStorage";

function formatTime(ts: number) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

export function CommunityPage() {
  const session = useMemo(() => getSession(), []);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [viewPostId, setViewPostId] = useState<string | null>(null);

  const [caption, setCaption] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [commentTextByPostId, setCommentTextByPostId] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadPosts() {
      try {
        const posts = await loadCommunityPosts();
        setPosts(posts);
      } catch (e) {
        console.error("Error loading community posts:", e);
        setPosts([]);
      }
    }
    loadPosts();
  }, []);

  // If another tab updates community posts, refresh this feed.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "efood.community.posts") {
        async function refreshPosts() {
          const updated = await loadCommunityPosts();
          setPosts(updated);
        }
        refreshPosts();
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function refresh() {
    try {
      const updated = await loadCommunityPosts();
      setPosts(updated);
    } catch (e) {
      console.error("Error refreshing posts:", e);
    }
  }

  async function onPickImage(file: File | null) {
    if (!file) {
      setImageDataUrl(undefined);
      return;
    }
    const reader = new FileReader();
    const dataUrl: string = await new Promise((resolve, reject) => {
      reader.onerror = () => reject(new Error("Image read failed"));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
    setImageDataUrl(dataUrl);
  }

  async function submitPost() {
    if (!session) return;
    const text = caption.trim();
    if (!text) return;

    setCreating(true);
    try {
      await addCommunityPost({
        authorName: session.name,
        authorEmail: session.email,
        caption: text,
        imageDataUrl,
      });
      setCaption("");
      setImageDataUrl(undefined);
      const updated = await loadCommunityPosts();
      setPosts(updated);
    } catch (e) {
      console.error('Error submitting post:', e);
    } finally {
      setCreating(false);
    }
  }

  async function onLike(postId: string) {
    if (!session) return;
    try {
      await toggleLike(postId, { email: session.email, name: session.name });
      await refresh();
    } catch (e) {
      console.error("Error liking post:", e);
    }
  }

  async function onAddComment(postId: string) {
    if (!session) return;
    const text = (commentTextByPostId[postId] ?? "").trim();
    if (!text) return;
    try {
      await addComment({ postId, user: { email: session.email, name: session.name }, text });
      setCommentTextByPostId((prev) => ({ ...prev, [postId]: "" }));
      await refresh();
    } catch (e) {
      console.error("Error adding comment:", e);
    }
  }

  const trendingTopics = ["Plant-forward meals", "Lower sodium swaps", "Reading ingredient labels", "Hydration tips"];

  const viewedPost = useMemo(() => {
    if (!viewPostId) return null;
    return posts.find((p) => p.id === viewPostId) ?? null;
  }, [posts, viewPostId]);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-600">Healthy community</div>
            <h1 className="mt-2 text-3xl font-semibold text-ink-900">Share meals, swap tips</h1>
            <p className="mt-3 text-sm text-gray-700">
              Post about healthy eating, recipes, fitness routines, and wellness tips. Everything is stored locally in this prototype.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="text-sm font-semibold text-ink-900">Community highlights</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {trendingTopics.map((t) => (
                <Chip key={t} tone="neutral">
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-ink-900">Create a post</div>
                <div className="mt-1 text-sm text-gray-600">Keep it supportive and practical.</div>
              </div>
              {session ? <Badge tone="green">Signed in</Badge> : <Badge tone="neutral">Guest</Badge>}
            </div>

            <div className="mt-4">
              <Textarea
                label="Caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share your meal swap, recipe, or ingredient-label tip..."
              />
            </div>

            <div className="mt-4 space-y-1">
              <div className="text-sm font-semibold text-gray-700">Optional image</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm"
              />
              {imageDataUrl ? <div className="mt-2 text-xs text-gray-600">Image selected.</div> : null}
            </div>

            <div className="mt-5">
              <Button onClick={submitPost} disabled={!session || creating}>
                {creating ? "Posting..." : session ? "Post to community" : "Sign in to post"}
              </Button>
              {!session ? <div className="mt-2 text-xs text-gray-600">Use the login page to create posts.</div> : null}
            </div>
          </Card>

          <div className="grid gap-4">
            {posts.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
                No posts yet. Be the first to share a healthy tip.
              </div>
            ) : null}

            {posts.map((p) => (
              <TiltCard key={p.id} className="rounded-xl">
                <Card className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-ink-900">{p.authorName}</div>
                      <div className="mt-1 text-xs text-gray-600">{formatTime(p.createdAt)}</div>
                    </div>
                    <Badge tone="neutral">Community</Badge>
                  </div>

                  {p.imageDataUrl ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
                      <img src={p.imageDataUrl} alt="Post attachment" className="h-56 w-full object-cover" />
                    </div>
                  ) : (
                    <div className="mt-4 h-56 rounded-xl border border-gray-100 bg-gradient-to-br from-brandGreen-100 via-softOrange-50 to-white" />
                  )}

                  <div className="mt-4 text-sm text-gray-800 leading-relaxed">{p.caption}</div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => onLike(p.id)}>
                      Like ({p.likes})
                      </Button>
                      <Button variant="secondary" onClick={() => setViewPostId(p.id)}>
                        View post
                      </Button>
                    </div>
                    <div className="text-xs text-gray-600">{p.comments.length} comment(s)</div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold text-ink-900">Add a comment</div>
                    <div className="mt-2 space-y-2">
                      <Input
                        value={commentTextByPostId[p.id] ?? ""}
                        onChange={(e) => setCommentTextByPostId((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Write something helpful..."
                        disabled={!session}
                      />
                      <Button variant="primary" onClick={() => onAddComment(p.id)} disabled={!session}>
                        Comment
                      </Button>
                    </div>
                  </div>

                  {p.comments.length > 0 ? (
                    <div className="mt-4 divide-y divide-gray-100">
                      {p.comments.slice(0, 4).map((c) => (
                        <div key={c.id} className="py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-ink-900">{c.authorName}</div>
                            <div className="text-xs text-gray-600">{formatTime(c.createdAt)}</div>
                          </div>
                          <div className="mt-1 text-sm text-gray-700">{c.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Card>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(viewedPost)}
        title={viewedPost ? `Post by ${viewedPost.authorName}` : undefined}
        onClose={() => setViewPostId(null)}
        footer={
          viewedPost ? (
            <div className="flex items-center justify-between gap-3">
              <Button variant="secondary" onClick={() => setViewPostId(null)}>
                Cancel
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => onLike(viewedPost.id)}>
                  Like ({viewedPost.likes})
                </Button>
                <div className="text-xs text-gray-600">{viewedPost.comments.length} comment(s)</div>
              </div>
            </div>
          ) : null
        }
      >
        {viewedPost ? (
          <div>
            <div className="text-xs text-gray-600">{formatTime(viewedPost.createdAt)}</div>
            <div className="mt-3 text-sm text-gray-800 leading-relaxed">{viewedPost.caption}</div>

            {viewedPost.imageDataUrl ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
                <img src={viewedPost.imageDataUrl} alt="Post attachment" className="max-h-[360px] w-full object-cover" />
              </div>
            ) : null}

            <div className="mt-6">
              <div className="text-sm font-semibold text-ink-900">Comments</div>
              <div className="mt-3 space-y-3 max-h-[320px] overflow-auto pr-1">
                {viewedPost.comments.length === 0 ? (
                  <div className="text-sm text-gray-600">No comments yet. Be the first.</div>
                ) : (
                  viewedPost.comments.map((c) => (
                    <div key={c.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-ink-900">{c.authorName}</div>
                        <div className="text-xs text-gray-600">{formatTime(c.createdAt)}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-700">{c.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold text-ink-900">Add a comment</div>
              <div className="mt-2 space-y-2">
                <Input
                  value={commentTextByPostId[viewedPost.id] ?? ""}
                  onChange={(e) => setCommentTextByPostId((prev) => ({ ...prev, [viewedPost.id]: e.target.value }))}
                  placeholder="Write something helpful..."
                  disabled={!session}
                />
                <Button
                  onClick={() => onAddComment(viewedPost.id)}
                  disabled={!session}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageShell>
  );
}

