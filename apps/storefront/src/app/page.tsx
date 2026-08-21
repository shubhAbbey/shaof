export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl">
          Fashion Ecommerce MVP
        </h1>
        <p className="text-lg text-gray-600">
          Project foundation successfully bootstrapped with Next.js App Router, Medusa v2 SDK, and
          native workspaces.
        </p>
        <div className="mt-6 inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-600 border border-brand-100">
          Task 01: Project Foundation Ready
        </div>
      </div>
    </main>
  );
}
