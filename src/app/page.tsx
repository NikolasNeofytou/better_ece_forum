export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-100">
            Better ECE Forum
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            A modern forum platform for NTUA ECE students
          </p>
          
          <div className="pt-8 space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                ✓ Development Environment Ready
              </p>
            </div>
            
            <div className="grid gap-4 text-left max-w-md mx-auto">
              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Next Steps
                </h3>
                <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>✓ Next.js 16 with TypeScript</li>
                  <li>✓ Tailwind CSS v4 configured</li>
                  <li>✓ shadcn/ui ready</li>
                  <li>✓ PostgreSQL + Redis setup</li>
                  <li>✓ Prisma ORM configured</li>
                  <li>✓ GitHub Actions CI pipeline</li>
                </ul>
              </div>
              
              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Coming Next
                </h3>
                <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>→ User authentication system</li>
                  <li>→ Post creation and management</li>
                  <li>→ Comment system</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
