import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback
}: ProtectedRouteProps) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        {fallback || (
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 text-center">
              <div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                  Authentication Required
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Please sign in to access this content
                </p>
              </div>
              <SignInButton mode="modal">
                <button className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        )}
      </SignedOut>
    </>
  );
}