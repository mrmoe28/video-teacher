import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Create a route matcher for protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/settings(.*)',
  '/admin(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Only apply Clerk middleware if environment variables are properly configured
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  
  // If Clerk is not properly configured, skip middleware
  if (!clerkPublishableKey || !clerkSecretKey || 
      clerkPublishableKey.includes('your_publishable_key_here') ||
      clerkPublishableKey.includes('placeholder')) {
    return NextResponse.next();
  }

  // Apply Clerk middleware for protected routes
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};