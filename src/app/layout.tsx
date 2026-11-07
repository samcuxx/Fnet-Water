import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProviders";

export const metadata: Metadata = {
  title: "F Net Water Hub — Water Supply & Smart Dispenser Management",
  description:
    "Technology-driven water supply, bottle exchange, smart dispenser tracking, and payments platform for Ghana.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-outfit min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
