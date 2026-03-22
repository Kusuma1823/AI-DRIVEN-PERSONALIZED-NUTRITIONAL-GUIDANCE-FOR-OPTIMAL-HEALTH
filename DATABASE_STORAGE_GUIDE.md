# Database Storage Locations - Complete Reference

## 📍 Primary Database: SQLite

### Location
```
ml_backend/data/efood.db
```

### Structure
The SQLite database has the following tables:

#### 1. `users` table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at INTEGER NOT NULL
)
```
**Stores**: User account information
**Access**: `ml_backend/database.py` → `save_user()`, `get_user()`

#### 2. `user_profiles` table
```sql
CREATE TABLE user_profiles (
    email TEXT PRIMARY KEY,
    age INTEGER,
    gender TEXT,
    height_cm REAL,
    weight_kg REAL,
    bmi REAL,
    allergies TEXT,  -- JSON string
    health_conditions TEXT,  -- JSON string
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(email) REFERENCES users(email)
)
```
**Stores**: User health profile data, allergies, conditions
**Access**: `ml_backend/database.py` → `save_user_profile()`, `get_user_profile()`

#### 3. `saved_foods` table
```sql
CREATE TABLE saved_foods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    food_id TEXT NOT NULL,
    food_name TEXT NOT NULL,
    category TEXT,
    unhealthy_percentage REAL,
    saved_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
```
**Stores**: Foods saved by users
**Access**: `ml_backend/database.py` → `save_food()`, `get_saved_foods()`, `remove_saved_food()`

#### 4. `feedback_tickets` table
```sql
CREATE TABLE feedback_tickets (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT NOT NULL,
    proof_data_url TEXT,
    status TEXT DEFAULT 'Received',
    created_at INTEGER NOT NULL
)
```
**Stores**: User feedback and bug reports
**Access**: `ml_backend/database.py` → `save_feedback()`, `get_all_feedback()`

#### 5. `community_posts` table
```sql
CREATE TABLE community_posts (
    id TEXT PRIMARY KEY,
    author_email TEXT NOT NULL,
    caption TEXT NOT NULL,
    image_data_url TEXT,
    likes INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(author_email) REFERENCES users(email)
)
```
**Stores**: Community posts, captions, and likes count
**Access**: `ml_backend/database.py` → `save_community_post()`, `get_all_community_posts()`
**Note**: Comments are NOT stored in SQLite yet (only likes count)

#### 6. `contact_submissions` table
```sql
CREATE TABLE contact_submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    submitted_at INTEGER NOT NULL
)
```
**Stores**: Contact form submissions
**Access**: `ml_backend/database.py` → Contact endpoints

---

## 🗄️ Current Storage: In-Memory (server.js)

### Location
Node.js Express server memory (file: `server.js`)

### Storage Objects
```javascript
// Global in-memory objects
const savedFoods = {}         // userId → [SavedFood]
const communities = {}        // postId → CommunityPost
const contactMessages = []    // contact form submissions
```

### Format Examples

#### Saved Foods
```javascript
savedFoods["user123"] = [
  {
    id: "1234567890",
    food_id: "1",
    food_name: "Apple",
    category: "Fruit",
    unhealthyPercentage: 5,
    savedAt: new Date(),
    foodId: "1"
  },
  // ... more foods
]
```

#### Community Posts
```javascript
communities["12345"] = {
  id: "12345",
  userId: "user123",
  authorEmail: "user@example.com",
  caption: "This is my healthy meal!",
  imageDataUrl: "data:image/png;base64,...",
  createdAt: new Date(),
  likes: 5,
  likedByEmails: ["user@example.com", "other@example.com"],
  comments: [
    {
      id: "comment1",
      authorEmail: "commenter@example.com",
      authorName: "Commenter",
      text: "Great post!",
      createdAt: new Date()
    }
  ]
}
```

---

## ⚠️ Data Persistence Comparison

### Option 1: Current Express Server (server.js)
```
Pros:
✅ Fast in-memory access
✅ Simple to understand
✅ No database dependencies

Cons:
❌ Data lost on server restart
❌ Data not shared between server instances
❌ No data recovery options
❌ Limited to available RAM
```

**Use Case**: Testing, development only

### Option 2: SQLite (Python Flask Backend)
```
Pros:
✅ Data survives server restarts
✅ Serverless, file-based
✅ Already implemented in ML backend
✅ No external database setup needed
✅ Good for small-to-medium apps

Cons:
❌ Slower than in-memory
❌ Not ideal for high-scale apps
❌ Requires file system access
❌ Limited concurrent writes
```

**Use Case**: Production small-scale app

**File**: `ml_backend/data/efood.db`
**Initialization**: `ml_backend/database.py` → `init_database()`

### Option 3: PostgreSQL/MongoDB (Production)
```
Pros:
✅ Scalable for millions of records
✅ Supports complex queries
✅ Built-in replication/backup
✅ Multi-instance deployment
✅ Professional support

Cons:
❌ Requires external deployment
❌ Higher operational complexity
❌ Additional cost
```

**Use Case**: Production scale deployment

---

## 🔄 How to Access Data

### From Python Backend
```python
from ml_backend.database import Database
from ml_backend import database as db

# Get user
user = db.get_user("user@example.com")

# Get saved foods
foods = db.get_saved_foods("user123")

# Get community posts
posts = db.get_all_community_posts()

# Get community posts by user
user_posts = db.get_user_community_posts("user@example.com")
```

### From Express Backend
```javascript
// Using in-memory storage
const userSavedFoods = savedFoods[userId]

// Direct API calls (frontend)
fetch('http://localhost:5000/api/db/saved-foods/user123')
fetch('http://localhost:5000/api/db/community')
```

### From Frontend
```typescript
// Using dbClient
import { dbClient } from "../lib/database/dbClient";

// Get saved foods
const foods = await dbClient.savedFoods.getAll(userId);

// Get community posts
const posts = await dbClient.community.getAll();
```

---

## 📊 API Endpoints and Storage

### Saved Foods
| Endpoint | Method | Storage | Persistent? |
|----------|--------|---------|------------|
| `/api/db/saved-foods` | POST | In-Memory | ❌ |
| `/api/db/saved-foods/:userId` | GET | In-Memory | ❌ |
| `/api/db/saved-foods/:foodId` | DELETE | In-Memory | ❌ |

### Community
| Endpoint | Method | Storage | Persistent? |
|----------|--------|---------|------------|
| `/api/db/community` | POST | In-Memory | ❌ |
| `/api/db/community` | GET | In-Memory | ❌ |
| `/api/db/community/:postId/like` | PUT | In-Memory | ❌ |
| `/api/db/community/:postId/comment` | POST | In-Memory | ❌ |

---

## 🔗 Data Relationships (ER Diagram)

```
users (1)
  ├── (1) user_profiles
  ├── (n) saved_foods
  ├── (n) community_posts
  │    └── (n) comments
  └── (n) feedback_tickets

community_posts (1)
  ├── (n) likedByEmails (tracked in likedByEmails array)
  └── (n) comments

contact_submissions (standalone)
```

---

## 📝 Configuration

### SQLite Database File
**Location**: `ml_backend/data/efood.db`
**Created**: Automatically on first run
**Size**: Grows with data (typically KB-MB)

### Environment Variables
Currently none configured, but could add:
```
DATABASE_URL=sqlite:ml_backend/data/efood.db
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

---

## 🚀 Recommended Setup

### Development
```
Use: server.js (Express in-memory)
Data: Lost on restart (acceptable for dev)
Speed: Fast
Setup: 0 steps
```

### Testing
```
Use: SQLite backend (ml_backend/app.py)
Data: Persistent between restarts
Speed: Good
Setup: 1. cd ml_backend 2. python app.py
```

### Production
```
Use: PostgreSQL + API Gateway
Data: Replicated, backed up
Speed: Optimized
Setup: Docker, Kubernetes, managed database
```

---

## 📋 Migration Path

To switch from in-memory to SQLite:

1. Stop Express server
2. Start Python Flask backend:
   ```bash
   cd ml_backend
   python app.py  # Connects to SQLite
   ```
3. Update frontend to use Flask endpoints (port 5000 but different routes)
4. Test all features
5. Verify data persists after restart

To switch to PostgreSQL:

1. Install PostgreSQL
2. Install Python PostgreSQL driver: `pip install psycopg2`
3. Update `ml_backend/database.py` to use PostgreSQL connection
4. Run migration script to create tables
5. Update environment variables
6. Restart services

---

## ✅ Current Status

**Frontend**: Uses Express server (in-memory)
**Database**: SQLite exists but not connected to Express
**Issue**: Data not persistent between restarts
**Fix**: Either use Flask backend or add SQLite to Express

---

## 🎯 Quick Decision

Choose one:

1. **Keep Current Setup** (fastest):
   - Accept in-memory data loss
   - Use for development/testing only
   - No changes needed

2. **Add Persistence** (recommended):
   - Switch to Flask backend
   - 2 minute setup
   - Data survives restarts
   - Use for production demo

3. **Scale for Production** (enterprise):
   - Deploy PostgreSQL database
   - Setup replication and backups
   - Load balancer for multiple servers
   - Professional support available

Recommendation: **Option 2** for best balance of features and simplicity!
