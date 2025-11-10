import { auth } from "@/lib/auth/config";
import { signOut } from "@/lib/auth/config";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header with auth buttons */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Better ECE Forum
          </h2>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Welcome, {session.user.name || session.user.email}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-100">
            Better ECE Forum
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            A modern forum platform for NTUA ECE students
          </p>

          <div className="pt-8 space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                ✓ Authentication System Ready
              </p>
            </div>

            <div className="grid gap-4 text-left max-w-md mx-auto">
              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Phase 1 Complete
                </h3>
                <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>✓ Next.js 16 with TypeScript</li>
                  <li>✓ Tailwind CSS v4 configured</li>
                  <li>✓ shadcn/ui ready</li>
                  <li>✓ PostgreSQL + Redis setup</li>
                  <li>✓ Prisma ORM configured</li>
                  <li>✓ GitHub Actions CI pipeline</li>
                  <li>✓ User authentication (email/password & OAuth)</li>
                  <li>✓ Protected routes & middleware</li>
                </ul>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Coming Next
                </h3>
                <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>→ Post creation and management</li>
                  <li>→ Comment system</li>
                  <li>→ Categories and tags</li>
                </ul>
              </div>
            </div>

            {!session && (
              <div className="pt-4">
                <Link
                  href="/auth/signup"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
