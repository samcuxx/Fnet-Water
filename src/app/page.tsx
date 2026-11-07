import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/brand/Logo";
import ThemeToggleButton from "@/components/common/ThemeToggleButton";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col lg:flex-row">
      {/* Left Column (Desktop) / Primary Content Container (Mobile) */}
      <div className="flex-1 lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen lg:min-h-0 z-10">
        {/* Navigation */}
        <header className="flex items-center justify-between pb-4 sm:pb-6">
          <Logo size="md" />
          <ThemeToggleButton showLabel={false} />
        </header>

        {/* Hero Content */}
        <main className="py-6 sm:py-10 lg:py-14 max-w-lg">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
            Water delivery &amp; smart dispensers
          </h1>

          <p className="mt-3 sm:mt-5 text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Order 19L refills, track scheduled deliveries, and manage dispenser plans across Ghana.
          </p>

          <div className="mt-6 sm:mt-8">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile-only Hero Image Showcase */}
          <div className="lg:hidden relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden mt-8 border border-gray-100 dark:border-gray-800/80 shadow-theme-xs">
            <Image
              src="/images/hero/water-hero.jpg"
              alt="F Net Water Hub commercial dispenser and pure water refill bottle"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="pt-6 text-xs text-gray-500 dark:text-gray-400">
          <div>&copy; {new Date().getFullYear()} F Net Water Hub. Accra, Ghana.</div>
        </footer>
      </div>

      {/* Right Column (Desktop Only): Pure Full-Height Image with Seamless Dissolve */}
      <div className="hidden lg:block relative lg:w-1/2 min-h-screen overflow-hidden">
        <Image
          src="/images/hero/water-hero.jpg"
          alt="F Net Water Hub commercial dispenser and pure water refill bottle"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />

        {/* Soft gradient dissolve blending seamlessly into the background */}
        {/* Light mode gradient */}
        <div className="absolute inset-y-0 left-0 w-32 xl:w-48 bg-gradient-to-r from-white to-transparent dark:hidden pointer-events-none" />
        {/* Dark mode gradient */}
        <div className="hidden dark:block absolute inset-y-0 left-0 w-32 xl:w-48 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
