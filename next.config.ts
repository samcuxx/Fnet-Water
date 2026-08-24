import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces .next/standalone for a small production container image.
  output: "standalone",

  experimental: {
    // Required for forbidden() / unauthorized(), which back the RBAC
    // interrupts in lib/auth. See docs/ARCHITECTURE.md §5.3.
    authInterrupts: true,
  },

  // Object storage and password hashing run only on the server and should not
  // be traced into the client bundle.
  serverExternalPackages: ["minio", "bcryptjs"],

  images: {
    // Product, dispenser and evidence images are streamed through our own
    // authorized route rather than fetched from a third-party origin.
    remotePatterns: [],
  },
};

export default nextConfig;
