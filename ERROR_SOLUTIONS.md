# Error Solutions Documentation

## Vercel Deployment Errors

### Error: "Function Runtimes must have a valid version, for example 'now-php@1.0.0'"

**Problem:** This error occurs when your `vercel.json` configuration references non-existent API routes or uses incorrect runtime specifications.

**Root Causes:**
1. Referencing API files that don't exist in your project
2. Using outdated runtime specification format
3. Incorrect file paths in the functions configuration

**Solution:**
1. **Check if referenced files exist:** Ensure all files listed in `vercel.json` actually exist in your project
2. **Use wildcard patterns:** Instead of listing individual files, use patterns like `app/api/**/*.ts`
3. **Simplify configuration:** For Next.js projects, you often don't need a complex `vercel.json` at all

**Example Fixed Configuration:**
```json
{
  "version": 2,
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

**Prevention:**
- Only reference files that actually exist
- Use wildcard patterns for dynamic API routes
- Test your configuration locally before deploying
- Keep `vercel.json` minimal for Next.js projects

**Date Fixed:** $(date)
**Project:** video-teacher

### Excluding Files from Vercel Deployment

**Problem:** Documentation files (README.md, etc.) are being included in Vercel deployment, increasing bundle size unnecessarily.

**Solution:**
1. **Create `.vercelignore` file** to exclude documentation and development files
2. **Update `vercel.json`** with proper build configuration
3. **Use `ignoreCommand`** to skip builds when only documentation changes

**Example `.vercelignore`:**
```
# Documentation files
README.md
*.md
.env.local
.env.development
```

**Prevention:**
- Always create `.vercelignore` for documentation files
- Use `ignoreCommand` in vercel.json for smart builds
- Keep production bundle minimal

**Date Fixed:** $(date)
**Project:** video-teacher
