# Error Solutions

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
