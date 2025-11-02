## Current Database Schema

This document provides complete reference for the ClaudeCode Sentiment Monitor database schema.

### Schema Location

- **File**: `app/app/prisma/schema.prisma`
- **Generated Client**: `app/app/generated/prisma/`
- **Import**: `import { PrismaClient } from "@/generated/prisma/client"`

### Tables and Relationships

```
raw_posts (Reddit posts)
    ↓ 1:N (cascade delete)
raw_comments (Reddit comments)
    ↓ 1:1 (optional)
sentiment_results (AI sentiment analysis)

daily_aggregates (Pre-computed daily stats - independent)
```

### Model: RawPost

Stores Reddit posts from monitored subreddits.

**Fields:**
- `id` (String, PK) - Reddit post ID (e.g., "1a2b3c")
- `subreddit` (String) - "ClaudeAI", "ClaudeCode", or "Anthropic"
- `author` (String) - Reddit username
- `title` (String) - Post title
- `body` (String?) - Post content (null for link posts)
- `score` (Int) - Upvote count (mutable)
- `createdAt` (DateTime) - Post creation timestamp
- `fetchedAt` (DateTime) - When we fetched it
- `url` (String) - Reddit URL
- `numComments` (Int) - Comment count (mutable)

**Relations:**
- `comments` - One-to-many to RawComment
- `sentiment` - One-to-one to SentimentResult (optional)

**Indexes:**
- `[subreddit, createdAt]` - Time-series queries by subreddit
- `[createdAt]` - Cross-subreddit time-series queries

**Database Table:** `raw_posts`

**Notes:**
- `score` and `numComments` are updated on re-fetch (use upsert)
- `body` is null for link posts

### Model: RawComment

Stores Reddit comments (top-level only, nested replies ignored).

**Fields:**
- `id` (String, PK) - Reddit comment ID
- `postId` (String, FK) - Foreign key to RawPost
- `subreddit` (String) - Copied from post (denormalized)
- `author` (String) - Reddit username
- `body` (String) - Comment text (required)
- `score` (Int) - Comment upvotes (mutable)
- `createdAt` (DateTime) - Comment creation timestamp
- `fetchedAt` (DateTime) - When we fetched it
- `parentId` (String?) - Parent comment ID (for nested threads)

**Relations:**
- `post` - Many-to-one to RawPost (cascade delete)
- `sentiment` - One-to-one to SentimentResult (optional)

**Indexes:**
- `[postId]` - Fetch comments by post
- `[subreddit, createdAt]` - Time-series queries by subreddit

**Database Table:** `raw_comments`

**Notes:**
- `onDelete: Cascade` - Deleting a post deletes all its comments
- `subreddit` is denormalized for efficient filtering
- `score` is updated on re-fetch (use upsert)

### Model: SentimentResult

Stores AI-generated sentiment analysis with 7-day cache.

**Fields:**
- `id` (String, PK) - Auto-generated CUID
- `itemId` (String, UK) - References RawPost.id or RawComment.id
- `itemType` (String) - "post" or "comment" (discriminator)
- `sentiment` (Float) - Overall sentiment (-1 to +1)
- `positiveScore` (Float) - Positive component (0 to 1)
- `negativeScore` (Float) - Negative component (0 to 1)
- `neutralScore` (Float) - Neutral component (0 to 1, sum = 1.0)
- `confidence` (Float) - AI confidence level (0 to 1)
- `reasoning` (String?) - LLM explanation
- `analyzedAt` (DateTime) - Analysis timestamp
- `cacheKey` (String, UK) - SHA-256(context|text) for cache lookups

**Relations:**
- `post` - One-to-one to RawPost (conditional, cascade delete)
- `comment` - One-to-one to RawComment (conditional, cascade delete)

**Indexes:**
- `[itemType, analyzedAt]` - Analytics queries
- `[cacheKey]` - Cache lookups

**Database Table:** `sentiment_results`

**Notes:**
- `itemId` is unique - one sentiment per post/comment
- `cacheKey` enables 7-day cache (same content = cache hit)
- Component scores sum to 1.0
- Sentiment classification:
  - Positive: sentiment > 0.2
  - Negative: sentiment < -0.2
  - Neutral: -0.2 <= sentiment <= 0.2

### Model: DailyAggregate

Pre-computed daily statistics per subreddit for fast dashboard loads.

**Fields:**
- `id` (String, PK) - Auto-generated CUID
- `date` (DateTime) - Date key (Date type, e.g., 2024-01-01)
- `subreddit` (String) - Subreddit name
- `avgSentiment` (Float) - Mean sentiment for the day
- `positiveCount` (Int) - Count of positive items (sentiment > 0.2)
- `negativeCount` (Int) - Count of negative items (sentiment < -0.2)
- `neutralCount` (Int) - Count of neutral items (-0.2 to 0.2)
- `totalCount` (Int) - Total analyzed items
- `volumePosts` (Int) - Total posts (any sentiment, including unanalyzed)
- `volumeComments` (Int) - Total comments (any sentiment, including unanalyzed)
- `createdAt` (DateTime) - Record creation
- `updatedAt` (DateTime) - Last update (auto-updated)

**Constraints:**
- `@@unique([date, subreddit])` - One aggregate per day per subreddit

**Indexes:**
- `[subreddit, date]` - Time-series queries by subreddit
- `[date]` - Cross-subreddit aggregation

**Database Table:** `daily_aggregates`

**Notes:**
- Use upsert for idempotent updates
- Recompute after ingesting new data
- `volumePosts` and `volumeComments` include all items (not just analyzed)

### Common Query Patterns

#### Fetch posts with sentiment
```typescript
const posts = await prisma.rawPost.findMany({
  where: {
    subreddit: "ClaudeAI",
    createdAt: { gte: startDate, lt: endDate },
  },
  include: { sentiment: true },
  orderBy: { createdAt: "desc" },
  take: 50,
});
```

#### Upsert post (update mutable fields)
```typescript
await prisma.rawPost.upsert({
  where: { id: post.id },
  create: { /* all fields */ },
  update: {
    score: post.score,
    numComments: post.numComments,
  },
});
```

#### Find items needing sentiment analysis
```typescript
const items = await prisma.rawPost.findMany({
  where: {
    OR: [
      { sentiment: { is: null } }, // Never analyzed
      { sentiment: { analyzedAt: { lt: sevenDaysAgo } } }, // Stale cache
    ],
  },
});
```

#### Upsert daily aggregate
```typescript
await prisma.dailyAggregate.upsert({
  where: {
    date_subreddit: {
      date: new Date("2024-01-01"),
      subreddit: "ClaudeAI",
    },
  },
  create: { /* all fields */ },
  update: { /* recalculated fields */ },
});
```

#### Get time-series aggregates
```typescript
const aggregates = await prisma.dailyAggregate.findMany({
  where: {
    subreddit: "ClaudeAI",
    date: { gte: startDate, lt: endDate },
  },
  orderBy: { date: "asc" },
});
```

### Migration History

Migrations are stored in `app/app/prisma/migrations/`.

Key migrations:
- Initial schema: Created all 4 tables with indexes
- Schema uses snake_case for database columns, camelCase for Prisma models

### Environment Variables

Required in `.env.local`:
```bash
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

### Prisma Client Configuration

```typescript
// lib/prisma.ts
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? ["query", "error"]
    : ["error"],
});
```

### Important Constraints

1. **Cascade Delete**: Deleting a post deletes all its comments and sentiment
2. **Unique Keys**:
   - `raw_posts.id` - Reddit post ID
   - `raw_comments.id` - Reddit comment ID
   - `sentiment_results.itemId` - One sentiment per item
   - `sentiment_results.cacheKey` - Cache uniqueness
   - `daily_aggregates.[date, subreddit]` - One aggregate per day/subreddit

3. **Nullable Fields**:
   - `raw_posts.body` - Link posts have no body
   - `sentiment_results.reasoning` - Optional LLM explanation
   - `raw_comments.parentId` - Top-level comments have no parent

### Schema Design Principles

1. **Denormalization**: `subreddit` copied to comments for efficient filtering
2. **Mutable Fields**: `score` and `numComments` updated on re-fetch
3. **Cache Keys**: SHA-256 hashing for deterministic cache lookups
4. **Pre-computation**: Daily aggregates for fast dashboard loads
5. **Conditional Relations**: Sentiment can belong to post OR comment, not both
