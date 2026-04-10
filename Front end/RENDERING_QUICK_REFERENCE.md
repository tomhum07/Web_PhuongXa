# Next.js Rendering Configuration Quick Reference

## 🎯 Configuration Matrix

### Home Page & Main Routes

| Route         | Code                        | Config                     | Benefit            |
| ------------- | --------------------------- | -------------------------- | ------------------ |
| `/`           | `dynamic = 'force-static'`  | Pre-rendered, cached, fast | ⚡ Instant load    |
|               | `revalidate = 300`          | Auto-refresh every 5 min   | 🔄 Fresh content   |
| `/gioi-thieu` | `dynamic = 'force-static'`  | Pre-rendered, cached, fast | ⚡ Instant load    |
|               | `revalidate = 86400`        | Auto-refresh daily         | 📅 Long-term cache |
| `/lien-he`    | `dynamic = 'force-static'`  | Pre-rendered, cached, fast | ⚡ Instant load    |
|               | `revalidate = 604800`       | Auto-refresh weekly        | 📅 Very stable     |
| `/dich-vu`    | `dynamic = 'force-static'`  | Pre-rendered, cached, fast | ⚡ Instant load    |
|               | `revalidate = 3600`         | Auto-refresh hourly        | 🔄 Regular updates |
| `/thu-vien`   | `dynamic = 'force-dynamic'` | Generated per-request      | 🌐 Fresh gallery   |
|               | `revalidate = 1800`         | Cache for 30 min           | 💾 Partial caching |

### Dynamic Routes

| Route           | Function          | Code                        | Benefit                |
| --------------- | ----------------- | --------------------------- | ---------------------- |
| `/tin-tuc`      | List with filters | `dynamic = 'force-dynamic'` | 🔍 Supports ?category= |
|                 |                   | `revalidate = 300`          | 🔄 Updated articles    |
| `/tin-tuc/[id]` | Article detail    | `generateStaticParams()`    | Pre-generates all      |
|                 |                   | `dynamicParams = false`     | 🛡️ No orphan pages     |
|                 |                   | `revalidate = 600`          | 🔄 Updated content     |
|                 |                   | `generateMetadata()`        | 📝 Dynamic SEO tags    |

---

## 📋 Configuration Checklist

### Build Time (next build)

- [ ] Static pages are pre-generated
- [ ] Dynamic article pages are pre-rendered
- [ ] No build errors or warnings
- [ ] API calls are cached

### Runtime (npm run dev / production)

- [ ] Static pages load instantly from cache
- [ ] ISR pages revalidate in background
- [ ] Dynamic pages accept query parameters
- [ ] Dynamic metadata is unique per page
- [ ] 404s returned for unknown article IDs

### SEO Benefits

- [ ] All pages have unique metadata
- [ ] Canonical URLs are set
- [ ] Schema.org structured data present
- [ ] Open Graph tags correct
- [ ] sitemap.xml is accessible

### Performance

- [ ] First Contentful Paint (FCP) < 1s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Time to Interactive (TTI) < 3.5s

---

## 🔧 How to Test Configurations

### Test Static Generation

```bash
# Build the project
npm run build

# Check generated pages exist
ls -la .next/static/pages/

# Start production server
npm run start

# Navigate to pages - should be instant
# Check Response Headers:
# x-next-cache: HIT (cached)
```

### Test ISR Revalidation

```bash
# 1. Build project
npm run build

# 2. Start production server
npm run start

# 3. Visit a page (cached version served)
# 4. Wait for revalidate time (e.g., 5 minutes)
# 5. Visit again - background revalidation triggers
# 6. Check Next.js logs for "revalidating" message
```

### Test Dynamic Routes

```bash
# Navigate with different query params
/tin-tuc?category=news
/tin-tuc?category=events

# Should show filtered results (requires force-dynamic)
```

### Test Dynamic Metadata

```bash
# View page source or DevTools
# Check <title> and <meta name="description">
# Should be specific to the page
```

---

## 🚨 Common Pitfalls to Avoid

### ❌ Don't Do This

```typescript
// ❌ Bad: Fetching data without caching
export default async function Page() {
  const data = await fetch("/api/articles");
}

// ❌ Bad: Using unsupported dynamic features
export const dynamic = "force-static";
export default function Page() {
  const router = useRouter(); // ERROR: Can't use in static!
}

// ❌ Bad: Setting both static and dynamic
export const dynamic = "force-static";
export const dynamic = "force-dynamic"; // Conflicting!

// ❌ Bad: Missing generateStaticParams for dynamic routes
export default function Page({ params }: { params: { id: string } }) {
  // Missing generateStaticParams() - will regenerate on every request!
}

// ❌ Bad: High revalidation time for frequently updated content
export const revalidate = 86400; // 1 day - for news articles? Too long!
```

### ✅ Do This Instead

```typescript
// ✅ Good: Cache data at build time
export async function generateStaticParams() {
  const data = await fetch('/api/articles');
  // data fetched once, cached
}

// ✅ Good: Use Server Components for static features
// No client-side hooks in static pages
export const dynamic = 'force-static';
export default function Page() {
  return <StaticContent />;
}

// ✅ Good: One consistent configuration
export const dynamic = 'force-static';
export const revalidate = 300;

// ✅ Good: Always use generateStaticParams for dynamic routes
export async function generateStaticParams() {
  // Pre-generate all possible routes
}

// ✅ Good: Appropriate revalidation time
export const revalidate = 300; // 5 minutes - for news
export const revalidate = 86400; // 1 day - for static info
```

---

## 📊 Performance Comparison

### Loading a Page

| Strategy    | Cached?   | Wait Time  | Updated?       | Use Case         |
| ----------- | --------- | ---------- | -------------- | ---------------- |
| **SSG**     | ✅ Always | 0ms        | ❌ Never       | Blueprints, docs |
| **SSG+ISR** | ✅ Yes    | 0ms        | ✅ Every N min | News, articles   |
| **SSR**     | ❌ No     | 100-500ms  | ✅ Always      | Real-time data   |
| **Hybrid**  | ✅ Mostly | Occasional | ✅ Partial     | Gallery, mixed   |

### Server Load

| Strategy    | Build       | Runtime     | Best For       |
| ----------- | ----------- | ----------- | -------------- |
| **SSG**     | 📈 Higher   | 📉 Low      | Static content |
| **SSG+ISR** | 📈 Higher   | 📉 Very Low | Most cases     |
| **SSR**     | 📉 Very Low | 📈 High     | Personalized   |
| **Hybrid**  | 📊 Medium   | 📊 Medium   | Balanced       |

---

## 🎯 Next Steps

### Immediate

1. ✅ Configurations applied
2. ✅ Guide documentation created
3. Run tests: `npm run build && npm run start`

### Short Term

- Monitor ISR revalidation in production
- Check Core Web Vitals metrics
- Verify all metadata is unique

### Medium Term

- Setup On-Demand ISR via API route
- Implement cache invalidation webhook
- Add monitoring/analytics

### Long Term

- Consider Edge Caching (Vercel, Cloudflare)
- Implement incremental optimization
- Regular performance audits

---

## 📞 Troubleshooting

**Q: Build taking too long?**  
A: Reduce `generateStaticParams()` results, use `dynamicParams: false`

**Q: Pages not updating?**  
A: Check `revalidate` value, ensure ISR enabled

**Q: 404 for new articles immediately after publishing?**  
A: Set `dynamicParams: true` (with caution), or manually trigger rebuild

**Q: Query parameters not working?**  
A: Use `force-dynamic` instead of `force-static`

**Q: SEO not improving?**  
A: Ensure `generateMetadata()` is unique per page

---

## 📚 Files Modified

- `/src/app/(site)/page.tsx` - Home page config
- `/src/app/(site)/tin-tuc/page.tsx` - News list config
- `/src/app/(site)/tin-tuc/[id]/page.tsx` - News detail config
- `/src/app/(site)/gioi-thieu/layout.tsx` - About page config
- `/src/app/(site)/lien-he/layout.tsx` - Contact page config
- `/src/app/(site)/dich-vu/layout.tsx` - Services page config
- `/src/app/(site)/thu-vien/layout.tsx` - Gallery page config

---

**Status:** ✅ Configured  
**Last Updated:** April 10, 2026
