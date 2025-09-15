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
