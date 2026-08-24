"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";

import { verifyPassword, fakeVerify } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { ROLE_HOME } from "@/lib/permissions";
import { toSafeError } from "@/lib/errors";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { formDataToObject, toFieldErrors } from "@/lib/validation";
import { AUDIT_ACTIONS, recordSafely } from "@/services/audit";
import { registerCustomer } from "@/services/customers/register";

/**
 * Authentication Server Actions.
 *
 * Server Actions are independently reachable POST endpoints, so each one
 * validates its own input rather than trusting the form that called it.
 *
 * `redirect()` throws a control-flow signal, so it is always called *outside*
 * try/catch — a catch block would swallow the navigation.
 */

export type AuthFormState = {
  message?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

async function requestContext() {
  const headerList = await headers();

  return {
    // x-forwarded-for is set by the reverse proxy in front of the app.
    ipAddress:
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip") ??
      null,
    userAgent: headerList.get("user-agent"),
  };
}

/** Only allow relative in-app paths, so `?next=` cannot become an open redirect. */
function safeRedirectTarget(next: string | undefined, fallback: string): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export async function login(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      message: "Enter your credentials to continue.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { identifier, password, next } = parsed.data;
  const context = await requestContext();

  let destination: string;

  try {
    const isEmail = identifier.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : { phone: identifier.replace(/[\s()-]/g, "") },
      select: {
        id: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    if (!user) {
      // Burn comparable time so response latency does not reveal whether the
      // account exists.
      await fakeVerify();

      await recordSafely({
        action: AUDIT_ACTIONS.loginFailed,
        entityType: "User",
        reason: "Unknown identifier",
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return { message: "Those credentials did not match our records." };
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      await recordSafely({
        userId: user.id,
        action: AUDIT_ACTIONS.loginFailed,
        entityType: "User",
        entityId: user.id,
        reason: "Incorrect password",
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      // Deliberately the same message as an unknown account: revealing that
      // the email exists would help enumerate users.
      return { message: "Those credentials did not match our records." };
    }

    if (user.status !== UserStatus.ACTIVE) {
      await recordSafely({
        userId: user.id,
        action: AUDIT_ACTIONS.loginFailed,
        entityType: "User",
        entityId: user.id,
        reason: `Account status is ${user.status}`,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return {
        message:
          "This account is not active. Please contact F Net Water Hub support.",
      };
    }

    await createSession({ id: user.id, role: user.role }, context);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await recordSafely({
      userId: user.id,
      action: AUDIT_ACTIONS.loginSucceeded,
      entityType: "User",
      entityId: user.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    destination = safeRedirectTarget(next, ROLE_HOME[user.role] ?? "/");
  } catch (error) {
    unstable_rethrow(error);
    return { message: toSafeError(error).message };
  }

  redirect(destination);
}

export async function register(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const context = await requestContext();
  let destination: string;

  try {
    const { userId, role } = await registerCustomer(parsed.data, context);

    await createSession({ id: userId, role }, context);

    destination = ROLE_HOME[role] ?? "/";
  } catch (error) {
    unstable_rethrow(error);

    const safe = toSafeError(error);

    return {
      message: safe.message,
      fieldErrors: safe.fieldErrors,
    };
  }

  redirect(destination);
}

export async function logout(): Promise<void> {
  try {
    await destroySession();
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to destroy session cleanly", error);
  }

  redirect("/login");
}
