# Error Solutions

## Clerk Missing PublishableKey Error
- Symptom: Next.js build fails with "Missing `publishableKey`" error from `@clerk/clerk-react`
- Fix: Add Clerk environment variables to your `.env.local` file:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
CLERK_SECRET_KEY="sk_test_your_secret_key_here"
```
- Get your keys from: https://dashboard.clerk.com/last-active?path=api
- Ensure `.env.local` is in your project root and not gitignored
- The `NEXT_PUBLIC_` prefix is required for client-side access
- Reference: https://clerk.com/docs/nextjs/getting-started-with-nextjs

## Google Fonts Network Timeout Error
- Symptom: Next.js build fails with "Failed to fetch `Geist` from Google Fonts" error
- Fix: Replace Google Fonts with system fonts or local fonts
- Remove `next/font/google` imports and use Tailwind's `font-sans` class
- Alternative: Use local font files or CDN fonts
- Reference: https://nextjs.org/docs/app/building-your-application/optimizing/fonts

## Clerk Invalid PublishableKey Error
- Symptom: Next.js build fails with "The publishableKey passed to Clerk is invalid"
- Fix: Add conditional rendering to handle missing/invalid Clerk keys
- Check for placeholder values and show fallback UI instead of failing build
- Ensure proper key format: `pk_test_` for test keys, `pk_live_` for production

## Tailwind v4 migration: '@tailwind base/components' not available
- Symptom: Lint errors like "'@tailwind base' is no longer available in v4".
- Fix: Replace directives in `app/globals.css` with:
```css
@import "tailwindcss/preflight";
@import "tailwindcss/utilities";
```
- Ensure `tailwindcss` is v4 in `devDependencies` and `@tailwindcss/postcss` is installed.
- Remove old `@tailwind components` layer usage; keep component classes under `@layer components` or utility classes.
- Reference: https://tailwindcss.com/docs/upgrade-guide (v4).
