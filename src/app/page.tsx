import Link from "next/link";
import Logo from "@/components/brand/Logo";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";

export default function HomePage() {
  const portals = [
    {
      title: "Customer Portal",
      description: "Order water refills, track delivery runs, and view dispenser payments.",
      role: "Customer",
      href: "/login?role=customer",
      cta: "Customer Login",
    },
    {
      title: "Driver Portal",
      description: "View daily route stops, delivery manifests, and bottle exchange records.",
      role: "Driver",
      href: "/login?role=driver",
      cta: "Driver Login",
    },
    {
      title: "Operations & Admin",
      description: "Dispatch orders, assign drivers, manage inventory, and view audit reports.",
      role: "Management",
      href: "/login?role=admin",
      cta: "Staff Login",
    },
    {
      title: "Field Agent Portal",
      description: "Register customers, record dispenser sales, and track commissions.",
      role: "Agent",
      href: "/login?role=agent",
      cta: "Agent Login",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-colors">
      {/* Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-3">
            <Link
              href="/login?role=customer"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-blue-light-400 px-3 py-1.5 transition"
            >
              Customer Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1 flex flex-col justify-center">
        <div className="max-w-2xl mb-14">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            Water delivery and smart dispenser management
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Scheduled refill deliveries, empty bottle exchanges, and dispenser installment plans across Accra and greater Ghana.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login?role=customer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 transition"
            >
              Order Water Refill
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition"
            >
              Access Portals
            </Link>
          </div>
        </div>

        {/* Portal Cards */}
        <div>
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3 mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Select Your Portal
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {portals.map((portal) => (
              <div
                key={portal.title}
                className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition"
              >
                <div>
                  <div className="text-xs font-semibold text-brand-600 dark:text-blue-light-400 mb-1">
                    {portal.role}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {portal.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal mb-5">
                    {portal.description}
                  </p>
                </div>

                <Link
                  href={portal.href}
                  className="text-xs font-medium text-brand-600 dark:text-blue-light-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>{portal.cta}</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Clean Footer with Theme Toggle */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} F Net Water Hub.</span>
            <span>Accra, Ghana.</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Ghana Cedis (GH₵)</span>
            <span>Paystack MoMo & Cards</span>
            <span>mNotify SMS</span>
          </div>

          <div>
            <ThemeToggleButton showLabel={true} />
          </div>
        </div>
      </footer>
    </div>
  );
}
