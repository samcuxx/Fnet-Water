import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUserByIdentifier, verifyStoredOtp } from "@/lib/auth-store";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fnet-water-hub-secret-dev-2026-very-secure",
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Phone / Email Credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
        isOtp: { label: "Is OTP", type: "text" },
        otpCode: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const isOtp = credentials.isOtp === "true";
        const identifier = credentials.identifier?.trim() || "";

        // Path A: mNotify SMS OTP Sign In
        if (isOtp) {
          const otpCode = credentials.otpCode?.trim() || "";
          if (!identifier || !otpCode) {
            throw new Error("Phone number and OTP code are required.");
          }

          const isValidOtp = await verifyStoredOtp(identifier, otpCode);
          if (!isValidOtp) {
            throw new Error("Invalid or expired OTP code. Please request a new one.");
          }

          const user = await findUserByIdentifier(identifier);
          if (!user) {
            throw new Error("No account registered with this phone number. Please sign up.");
          }

          if (user.status === "INACTIVE") {
            throw new Error("Account has been deactivated. Please contact support.");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
          };
        }

        // Path B: Password Sign In (Email or Ghana Phone)
        const password = credentials.password || "";
        if (!identifier || !password) {
          throw new Error("Please enter your email or phone number and password.");
        }

        const user = await findUserByIdentifier(identifier);
        if (!user) {
          throw new Error("Invalid credentials. Please verify your details or use a demo account.");
        }

        if (user.status === "INACTIVE") {
          throw new Error("Your account has been deactivated. Please contact management.");
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
          throw new Error("Incorrect password. Please try again or use OTP login.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.phone = token.phone as string;
        session.user.status = token.status;
      }
      return session;
    },
  },
};
