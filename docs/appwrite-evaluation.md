# Appwrite as Replacement for Supabase + Vercel — Evaluation

## Context

petertiltax.ch is a Next.js 15 tax consulting portal currently using **Supabase** (auth, PostgreSQL database, storage) and deployed to **GitHub Pages** (static export). The goal is to evaluate whether **Appwrite.io** could serve as a single platform replacing both Supabase (backend) and Vercel (hosting).

---

## Current Stack Summary

| Layer | Current Solution | Features Used |
|-------|-----------------|---------------|
| **Auth** | Supabase Auth | Email/password, SSR cookie sessions via `@supabase/ssr`, middleware route protection |
| **Database** | Supabase (PostgreSQL) | 8+ relational tables, RLS policies, triggers, RPC functions, foreign keys with CASCADE, upserts, unique constraints |
| **Storage** | Supabase Storage | Private bucket `portal-documents`, per-user folder structure |
| **API Routes** | Next.js App Router | 7-8 routes (Stripe, Resend, Twilio, document upload, status updates) |
| **Hosting** | GitHub Pages | Static export to `/out/` |
| **External** | Stripe, Resend, Twilio | Payments, email, SMS |

---

## Evaluation: Can Appwrite Replace Both?

### 1. Database — SIGNIFICANT CONCERNS

| Feature | Supabase (PostgreSQL) | Appwrite |
|---------|----------------------|----------|
| Data model | Relational (SQL) | Document-based (NoSQL) |
| Foreign keys + CASCADE | ✅ Native | ❌ No foreign keys — must handle in app code |
| Row Level Security | ✅ SQL policies on every table | ⚠️ Permission model exists but less flexible (document/collection-level, label-based) |
| Triggers | ✅ `handle_new_user()`, `update_updated_at()` | ❌ No DB triggers — must use Appwrite Functions as workaround |
| RPC Functions | ✅ `increment_referral_usage` | ❌ No equivalent — must use Functions |
| Unique constraints | ✅ `(user_id, year)` | ⚠️ Only on single attributes, no composite unique constraints |
| Complex queries | ✅ Full SQL with JOINs | ❌ No JOINs — must denormalize or do multiple queries |
| Upsert | ✅ Native with conflict resolution | ❌ Must implement manually (check-then-insert/update) |
| Relationships | ✅ Foreign key JOINs in `.select()` | ⚠️ Appwrite has "relationships" but no server-side JOINs |

**Impact**: Your schema is deeply relational. Migrating to Appwrite's document DB would require:
- Restructuring all 8+ tables into collections
- Removing all foreign key dependencies and handling referential integrity in application code
- Rewriting all queries that use JOINs, upserts, or relational selects
- Replacing RLS policies with Appwrite's permission system
- Creating Appwrite Functions to replace triggers and RPC calls

### 2. Authentication — MOSTLY COMPATIBLE

| Feature | Supabase | Appwrite |
|---------|----------|----------|
| Email/password | ✅ | ✅ |
| SSR support (Next.js) | ✅ `@supabase/ssr` with cookies | ⚠️ Appwrite has SSR support but less mature for Next.js |
| Auto-create profile on signup | ✅ DB trigger | ❌ Must use Appwrite Function |
| Role-based access | ✅ Via `profiles.role` column | ⚠️ Appwrite has Teams/Labels but different model |
| Middleware integration | ✅ Proven pattern | ⚠️ Would need custom implementation |

### 3. Storage — COMPATIBLE

| Feature | Supabase | Appwrite |
|---------|----------|----------|
| File uploads | ✅ | ✅ |
| Private buckets | ✅ | ✅ |
| Per-user permissions | ✅ Via RLS | ✅ Via document permissions |
| Size limits | Configurable | 50MB default |

Storage is the **easiest** part to migrate.

### 4. Hosting / Deployment — NOT POSSIBLE

**This is the critical blocker.** Appwrite is a **backend-as-a-service** — it does NOT host frontend applications.

| Need | Appwrite Capability |
|------|-------------------|
| Host Next.js SSR app | ❌ **Not supported** |
| Next.js middleware | ❌ **Not supported** |
| Static site hosting | ❌ **Not supported** |
| Serverless API routes | ⚠️ Appwrite Functions exist but are NOT Next.js API routes |

**You would still need a separate hosting provider** for your Next.js frontend:
- Vercel, Netlify, Coolify, Railway, or self-hosted

Appwrite Functions can run server-side code, but they use their own runtime (Node.js, Python, etc.) — not Next.js API routes. You'd need to either:
- Keep Next.js API routes on your hosting platform, OR
- Rewrite all 7-8 API routes as Appwrite Functions (different SDK, different patterns)

### 5. Self-Hosting Consideration

Appwrite can be self-hosted (Docker), which gives you more control but adds operational overhead:
- You'd need a server (VPS) to run Appwrite
- You'd STILL need to host the Next.js app separately
- Database backups, updates, and security become your responsibility

---

## Recommendation

### Appwrite is NOT a good fit for this project. Here's why:

1. **Cannot replace hosting** — You still need Vercel/Netlify/etc. for the Next.js app, so it doesn't consolidate platforms as hoped.

2. **Database migration is high-risk** — Your PostgreSQL schema is deeply relational (foreign keys, RLS, triggers, RPC, composite unique constraints). Migrating to a document DB would require significant restructuring and introduces risk of data integrity issues.

3. **Migration effort is very high** — Every database query, auth flow, and API route would need rewriting. Estimated 60-80% of backend code would change.

4. **Less mature Next.js SSR support** — Supabase's `@supabase/ssr` is purpose-built and well-tested for Next.js. Appwrite's SSR support is newer and less proven.

### Better alternatives to evaluate:

| Goal | Recommended Approach |
|------|---------------------|
| **Keep Supabase + deploy properly** | Deploy to **Vercel** (best Next.js support) — this is the simplest path |
| **Single platform (backend + hosting)** | Consider **Railway** or **Render** with a PostgreSQL database — keeps your relational schema |
| **Self-hosted everything** | **Coolify** (self-hosted PaaS) + Supabase self-hosted on same server |
| **Reduce costs** | Supabase free tier + Vercel free tier is very cost-effective for a portal this size |

### The simplest, lowest-risk path:

**Keep Supabase (it's working well) + deploy to Vercel** instead of GitHub Pages. This gives you:
- SSR support (your middleware and API routes will work properly — they don't on GitHub Pages static export)
- Zero migration effort on the backend
- Best-in-class Next.js hosting
- Both have generous free tiers

---

## Verification

This is an architectural evaluation — no code changes needed. The recommendation is based on:
- Analysis of all Supabase usage across the codebase (8+ tables, RLS, triggers, RPC, storage)
- Appwrite's documented capabilities and limitations
- The fundamental fact that Appwrite does not host frontend applications
