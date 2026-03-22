# Quick Testing Guide - All Features

## Prerequisites
- Node.js server running: `node server.js`
- Frontend running: `npm run dev`
- Browser at `http://localhost:5173`

## Test Scenarios

### 1️⃣ Food Save Button (Should Now Work!)

**Expected Behavior**: Button toggles between "Save Food" and "Remove from Saved"

Steps:
1. Go to Recommendation Analysis page (Food Analysis section)
2. Analyze any food item
3. **ACTION**: Click "Save Food" button
   - ✅ Button should change to "Remove from Saved"
   - ✅ Button shows "Saving..." briefly
4. **ACTION**: Click "Remove from Saved"
   - ✅ Button changes back to "Save Food"
5. Go to Saved Foods page
   - ✅ Should see the saved food in the list
6. Click "Remove" from saved foods list
   - ✅ Food is removed

**If Not Working**:
- Check browser console for errors (F12)
- Verify you're logged in (`admin@example.com` / `admin123`)
- Check server.js terminal for errors

---

### 2️⃣ Community Like Feature (Should Now Work!)

**Expected Behavior**: Like count increments/decrements on toggle

Steps:
1. Go to Community page
2. **ACTION**: Click "Like (0)" button on any post
   - ✅ Button should show "Like (1)"
   - ✅ Button style may change (secondary style)
3. **ACTION**: Click "Like (1)" again
   - ✅ Should go back to "Like (0)"
   - ✅ Can like multiple times by different users

**If Not Working**:
- Ensure you're logged in
- Check browser console (F12) for network errors
- Verify server is running and responding
- Look for 404 or 500 errors in server.js terminal

---

### 3️⃣ Community Comment Feature (Should Now Work!)

**Expected Behavior**: Comments appear immediately after submission

Steps:
1. Go to Community page
2. **ACTION**: Enter text in "Add a comment" input field (e.g., "Great post!")
3. **ACTION**: Click "Comment" button
   - ✅ Text should appear below with your name and timestamp
   - ✅ Input field should clear
   - ✅ Comment count should increment
4. Refresh page (F5)
   - ✅ Comments should persist

**If Not Working**:
- Check browser console for errors
- Verify input field has text before clicking
- Ensure you're logged in
- Check server terminal for POST errors

---

### 4️⃣ Database Storage Verification

**Where Data Is Stored**:
```
Node.js Server (server.js):
  - Saved Foods: In-memory (lost on restart)
  - Community Posts: In-memory (lost on restart)
  - Comments: In-memory (lost on restart)
  - Likes: In-memory (lost on restart)
```

**To Check If Data Works**:
1. Save a food → Go to Saved Foods page → Should see it
2. Create a community post → Should appear in feed
3. Like a post → Counter should update
4. Add a comment → Should appear immediately
5. **RESTART SERVER** (`Ctrl+C` then `node server.js`)
   - ⚠️ All data will be gone (this is expected with in-memory storage)

**If You Need Persistent Storage**:
- Use Python Flask backend instead:
  ```bash
  cd ml_backend
  python app.py
  ```
- This connects to `ml_backend/data/efood.db` (SQLite)
- Data survives server restarts

---

## Detailed Feature Fixes

### Save Food Button
**What Was Wrong**:
```javascript
// ❌ BEFORE - Calling async function synchronously
const [isSaved, setIsSaved] = useState(() => 
  session ? isFoodSaved(session.userId, ...) : false  // Returns Promise!
);
```

**What's Fixed Now**:
```javascript
// ✅ AFTER - Proper async/await in useEffect
useEffect(() => {
  async function checkIfSaved() {
    const saved = await isFoodSaved(session.userId, ...);
    setIsSaved(saved);
  }
  checkIfSaved();
}, [session, result.food.foodId]);
```

### Like Feature
**What Was Wrong**:
```typescript
// ❌ BEFORE - Empty TODO function
export async function toggleLike(postId: string, user: any): Promise<void> {
  // TODO: Implement like system in database
}
```

**What's Fixed Now**:
```typescript
// ✅ AFTER - Proper API call
export async function toggleLike(postId: string, user: { email: string; name: string }): Promise<void> {
  const res = await fetch(`${API_BASE}/community/${postId}/like`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail: user.email, userName: user.name }),
  });
  if (!res.ok) throw new Error('Failed to toggle like');
}
```

### Comment Feature
**What Was Wrong**:
```typescript
// ❌ BEFORE - Empty TODO function
export async function addComment(params: any): Promise<void> {
  // TODO: Implement comment system in database
}
```

**What's Fixed Now**:
```typescript
// ✅ AFTER - Proper API call with full data
export async function addComment(params: {
  postId: string;
  user: { email: string; name: string };
  text: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/community/${params.postId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userEmail: params.user.email,
      userName: params.user.name,
      text: params.text,
    }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
}
```

---

## Backend Endpoints Added

### PUT /api/db/community/:postId/like
Toggles like for a post by user

**Request**:
```json
{
  "userEmail": "user@example.com",
  "userName": "User Name"
}
```

**Response**:
```json
{
  "success": true,
  "likes": 5,
  "liked": true
}
```

### Updated POST /api/db/community/:postId/comment
Adds comment to post with user info

**Request** (Updated):
```json
{
  "userEmail": "user@example.com",
  "userName": "User Name",
  "text": "Great post!"
}
```

**Response**:
```json
{
  "success": true,
  "comment": {
    "id": "1234567890",
    "authorEmail": "user@example.com",
    "authorName": "User Name",
    "text": "Great post!",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

---

## Troubleshooting

### Issue: "Like button doesn't increment"
- [ ] Check if you're logged in
- [ ] Open browser DevTools (F12) → Network tab
- [ ] Click like button and check if PUT request succeeds
- [ ] Look for errors in server terminal

### Issue: "Comments not appearing"
- [ ] Ensure you entered text (not empty)
- [ ] Check browser console for errors
- [ ] Verify POST request in Network tab shows 201 status
- [ ] Check server.js terminal for express errors

### Issue: "Save Food button unresponsive"
- [ ] Make sure you're logged in
- [ ] Check if button is disabled (grayed out)
- [ ] Wait for "Saving..." to complete
- [ ] Check browser console for fetch errors

### Issue: "All data gone after restart"
- This is normal with `server.js` (in-memory storage)
- Switch to Flask backend for persistence
- Or implement SQLite in Express server

---

## Files Changed

🔧 Fixed:
- `src/features/recommendation/ui/RecommendationAnalysisDashboard.tsx`
- `src/features/community/communityStorage.ts`
- `src/pages/community/CommunityPage.tsx`
- `server.js`

📊 Database:
- Primary: `ml_backend/data/efood.db` (SQLite - not used by Express)
- Current: In-memory storage in `server.js`

---

## Next Steps (Optional Improvements)

1. ✅ **Switch to SQLite**: Use Python Flask backend for persistent data
2. 🔄 **Add Real-time Updates**: Implement WebSockets for live feed updates
3. 🔒 **Add Permissions**: Only allow users to delete their own posts
4. 📱 **Add Push Notifications**: Notify when someone likes/comments on your posts
5. 🎯 **Add Search/Filter**: Filter community posts by tags or keywords

Good luck testing! 🚀
