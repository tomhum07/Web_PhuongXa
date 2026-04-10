# SSR & SSG Configuration Guide - Phường Cao Lãnh Website

## 📋 Overview

Cấu hình Server-Side Rendering (SSR) và Static Site Generation (SSG) với Incremental Static Regeneration (ISR) để tối ưu hóa hiệu suất và SEO.

---

## 🎯 Rendering Strategies Được Sử Dụng

### 1. **Static Site Generation (SSG) with ISR**

Generated at build time and revalidated periodically in the background.

- **Best for**: Pages content ít thay đổi
- **Benefits**: Ultra-fast load times, great for SEO
- **Revalidation**: Background updates while serving cached content

### 2. **Dynamic Rendering (SSR)**

Generated on-demand for each request.

- **Best for**: Pages with query parameters, real-time data
- **Benefits**: Always fresh content
- **Trade-off**: Slower than SSG

### 3. **Hybrid Approach**

Mix của static generation + dynamic rendering cho optimal performance.

---

## 📊 Route Configuration Details

### **Pages with SSG + ISR**

#### 1. **Home Page** (`/`)

```
Config: force-static + revalidate every 5 minutes (300s)
Status: ✅ Static Generation with ISR
Reason: Main page should load super fast, updated frequently for news
```

- Pre-rendered at build time
- Content refreshed every 5 minutes in background
- Cached version served while revalidation happens
- Zero wait time for users (until expiration)

#### 2. **Giới Thiệu** (`/gioi-thieu`)

```
Config: force-static + revalidate every 24 hours (86400s)
Status: ✅ Static Generation with ISR
Reason: About content rarely changes, long-term validity
```

- Pre-rendered once
- Revalidated daily (sufficient for static content)
- Minimal server load

#### 3. **Liên Hệ** (`/lien-he`)

```
Config: force-static + revalidate every 7 days (604800s)
Status: ✅ Static Generation with ISR
Reason: Contact info is stable, seldom updated
```

- Pre-rendered once
- Weekly updates (very stable content)
- Extremely efficient

#### 4. **Dịch Vụ** (`/dich-vu`)

```
Config: force-static + revalidate every 1 hour (3600s)
Status: ✅ Static Generation with ISR
Reason: Services can be updated, but relatively stable
```

- Pre-rendered at build time
- Hourly background revalidation
- Handles occasional service updates

#### 5. **Thư Viện** (`/thu-vien`)

```
Config: force-dynamic + revalidate every 30 minutes (1800s)
Status: ⚙️ Dynamic Rendering with ISR
Reason: Image gallery loaded from API, content frequently updated
```

- Server-rendered on request to fetch latest images
- Cached for 30 minutes to avoid excessive API calls
- Hybrid approach for fresh gallery content + performance

---

### **Dynamic Routes with SSG**

#### 6. **Tin Tức Listing** (`/tin-tuc`)

```
Config: force-dynamic + revalidate every 5 minutes (300s)
Reason: Supports query params (?category=xxx)
```

- Server-rendered due to query parameter support
- Revalidated every 5 minutes for fresh article list
- Dynamic filtering by category needs SSR

#### 7. **Tin Tức Detail** (`/tin-tuc/[id]`)

```
Config: generateStaticParams + revalidate every 10 minutes (600s)
dynamicParams: false (disable on-demand generation)
Status: ✅ Static Generation with ISR
Reason: Pre-generate all articles, serve cached, refresh periodically
```

**generateStaticParams Flow:**

```typescript
1. Build time: Fetch all articles from API
2. Generate static pages for each article ID
3. Revalidate every 10 minutes in background
4. dynamicParams: false → Return 404 for unknown article IDs (not generate on demand)
5. Dynamic metadata generation via generateMetadata()
```

**Why dynamicParams = false?**

- Prevents generating pages for non-existent article IDs
- Returns 404 instead of generating them on-demand
- Improves performance and prevents spam/crawlers from consuming resources

---

## ⏱️ Revalidation Strategy

| Page                           | Revalidate | Reason                     |
| ------------------------------ | ---------- | -------------------------- |
| Home (/)                       | 5 min      | Frequent news updates      |
| Tin Tức (/tin-tuc)             | 5 min      | Article list changes       |
| Tin Tức Detail (/tin-tuc/[id]) | 10 min     | Article updates            |
| Dịch Vụ (/dich-vu)             | 1 hour     | Services relatively stable |
| Thư Viện (/thu-vien)           | 30 min     | Gallery updates            |
| Giới Thiệu (/gioi-thieu)       | 24 hours   | Static information         |
| Liên Hệ (/lien-he)             | 7 days     | Rarely changes             |

---

## 🔧 Configuration Options Explained

### **export const dynamic**

```typescript
// force-static - Always statically generate
// force-dynamic - Always server-render on request
// auto (default) - Next.js decides based on features used
```

### **export const revalidate**

```typescript
// Seconds between revalidations (ISR)
// 0 = never revalidate (only build time)
// 300 = revalidate every 5 minutes
// false = opt out of ISR, regenerate on every request
```

### **export const dynamicParams**

```typescript
// true = Generate unknown routes on-demand (slower)
// false = Return 404 for unknown routes (faster)
```

### **generateStaticParams()**

```typescript
// Pre-generate dynamic routes at build time
// Called once during build
// Only called for force-static routes
```

### **generateMetadata()**

```typescript
// Generate metadata dynamically for each route
// Called per-request (can access params)
// Great for dynamic titles/descriptions
```

---

## 📈 Performance Impact

### Build Time

```
- Static pages: Generated once at build time (~1-2s per page)
- Dynamic routes: Not pre-generated, fast builds
- Articles: generateStaticParams fetches data once
```

### Runtime Performance

```
- SSG: Near-instant (cached HTML) ✅
- ISR: Instant (cached) + background update ✅✅
- SSR (forced-dynamic): ~200-500ms (server compute needed) ⚠️
- Hybrid (ISR): Best of both worlds ✅✅✅
```

### Server Load

```
- SSG: Minimal (mostly cache hits)
- ISR: Minimal (background updates, no user wait)
- SSR: Moderate (per-request computation)
```

---

## 🚀 How ISR Works (Example: Article Page)

**Scenario: Article updated, user visits at revalidation time**

```javascript
// Build time (next build)
1. Article #123 exists
2. Generate /tin-tuc/123 as static HTML
3. Set revalidate = 600 (10 minutes)

// 5 minutes later
User visits /tin-tuc/123
→ Server returns cached HTML (instant) ✅
→ Marks page for background revalidation

// 5 minutes + 5 seconds later
Article #123 gets updated in database

// 10 minutes exactly (revalidation time)
Next request to /tin-tuc/123
→ Server returns STALE cached HTML immediately
→ In background, regenerate the page with fresh data
→ Replace cache

// Next user request after regen
→ Server returns FRESH HTML from cache ✅
```

---

## ✅ Best Practices

### 1. **Choose Right Revalidation Time**

```typescript
// Frequently updated content
export const revalidate = 300; // 5 minutes

// Moderately updated
export const revalidate = 3600; // 1 hour

// Rarely updated
export const revalidate = 86400; // 1 day
```

### 2. **Use generateStaticParams for Dynamic Routes**

```typescript
// ✅ Good: Pre-generate all articles
export async function generateStaticParams() {
  const articles = await getPublicArticles();
  return articles.map((a) => ({ id: String(a.articleId) }));
}

// ❌ Bad: Let every request be generated on-demand
export const dynamicParams = true; // (expensive)
```

### 3. **Set dynamicParams Appropriately**

```typescript
// ✅ Good: Prevent crawlers from creating pages
export const dynamicParams = false;

// ❌ Bad: Every spider request creates a new page
export const dynamicParams = true;
```

### 4. **Generate Metadata Dynamically**

```typescript
// ✅ Good: Unique title/description per article
export async function generateMetadata(params) {
  const article = await getArticleById(params.id);
  return {
    title: article.title,
    description: article.summary,
  };
}
```

### 5. **Cache External API Calls**

```typescript
// Fetch in generateStaticParams (cached at build)
export async function generateStaticParams() {
  const articles = await getPublicArticles(); // Cached once
}

// Don't re-fetch in the page component
// Use ISR revalidation instead
```

---

## 🔍 Monitoring & Debugging

### Check What's Being Generated

```bash
# In .next/static/chunks/pages
ls -la .next

# Preview ISR in development
npm run dev
# Navigate to pages and check cache behavior
```

### Check Cache Status

```typescript
// In Next.js 13+, check:
// x-next-cache header
// x-middleware-cache header (if using middleware)
```

### Revalidate On-Demand (if using API)

```typescript
// Optional: Invoke revalidation via API
import { revalidateTag } from "next/cache";

export async function POST(req) {
  revalidateTag("articles"); // Revalidate all article pages
}
```

---

## 📝 Common Issues & Solutions

### Issue: Page not updating after revalidate time

**Solution:**

- Check `revalidate` value is set
- Check ISR is not disabled on route
- Ensure `dynamicParams` is set correctly

### Issue: Build time is too long

**Solution:**

- Reduce number of dynamic params to pre-generate
- Use `dynamicParams: false` for dynamic routes
- Cache external API calls

### Issue: Pages not being generated

**Solution:**

- Verify `generateStaticParams` returns array
- Check `dynamicParams` setting
- Ensure page is not using unsupported dynamic features

### Issue: Query params not working

**Solution:**

- Use `force-dynamic` for pages with query params
- Cannot use query params with pure SSG
- Consider URL-based routing instead

---

## 📊 Current Configuration Summary

```
Route                     | Type              | Revalidate | Dynamic
=====================================================================
/                        | SSG + ISR         | 5 min      | static
/gioi-thieu              | SSG + ISR         | 24 hours   | static
/lien-he                 | SSG + ISR         | 7 days     | static
/dich-vu                 | SSG + ISR         | 1 hour     | static
/thu-vien                | Hybrid (ISR)      | 30 min     | dynamic
/tin-tuc                 | SSR + ISR         | 5 min      | dynamic
/tin-tuc/[id]            | SSG + ISR         | 10 min     | static
```

---

## 🎓 Additional Resources

- [Next.js Rendering Docs](https://nextjs.org/docs/app/building-your-application/rendering)
- [ISR Guide](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

---

**Last Updated:** April 10, 2026  
**Configuration Status:** ✅ Optimized for SEO & Performance
