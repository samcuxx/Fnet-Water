import "server-only";

import { prisma } from "@/lib/db";
import { BusinessRuleError, ValidationError } from "@/lib/errors";
import {
  NotificationCategory,
  ReferralStatus,
  UserRole,
  UserStatus,
} from "@/lib/generated/prisma/enums";
import { notify } from "@/lib/notifications";
import { hashPassword } from "@/lib/auth/password";
import {
  customerCode,
  referralCode as generateReferralCode,
  userCode,
} from "@/lib/utils/reference";
import type { RegisterInput } from "@/lib/validation/auth";
import { AUDIT_ACTIONS, record as recordAudit } from "@/services/audit";

/**
 * Customer self-registration.
 *
 * Runs as a single transaction because a customer is not usable until the
 * user, the profile, the bottle balance, the reward balance and (when a
 * referral code was supplied) the referral link all exist. A partial
 * registration would leave an account that cannot order or accrue rewards.
 */
export async function registerCustomer(
  input: RegisterInput,
  context: { ipAddress?: string | null; userAgent?: string | null } = {},
): Promise<{ userId: string; role: UserRole }> {
  const [emailTaken, phoneTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email: input.email }, select: { id: true } }),
    prisma.user.findUnique({ where: { phone: input.phone }, select: { id: true } }),
  ]);

  // Reported per-field so the form can point at the offending input. The
  // uniqueness constraints below remain the real guarantee against a race.
  if (emailTaken || phoneTaken) {
    throw new ValidationError("This account already exists.", {
      ...(emailTaken ? { email: ["An account with this email already exists."] } : {}),
      ...(phoneTaken ? { phone: ["An account with this phone number already exists."] } : {}),
    });
  }

  // Resolve the referrer before opening the transaction so a bad code fails
  // fast with a clear message.
  let referrer: { id: string; userId: string } | null = null;

  if (input.referralCode) {
    referrer = await prisma.customerProfile.findUnique({
      where: { referralCode: input.referralCode },
      select: { id: true, userId: true },
    });

    if (!referrer) {
      throw new ValidationError("That referral code is not recognised.", {
        referralCode: ["That referral code is not recognised."],
      });
    }
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const sequence = (await tx.user.count()) + 1;

    const user = await tx.user.create({
      data: {
        code: userCode(UserRole.CUSTOMER, sequence),
        email: input.email,
        phone: input.phone,
        passwordHash,
        fullName: input.fullName,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, role: true, fullName: true },
    });

    const customerSequence = (await tx.customerProfile.count()) + 1;

    const profile = await tx.customerProfile.create({
      data: {
        userId: user.id,
        customerCode: customerCode(customerSequence),
        referralCode: generateReferralCode(),
        ghanaDigitalAddress: input.ghanaDigitalAddress,
        referredByCustomerId: referrer?.id ?? null,
      },
      select: { id: true, customerCode: true, referralCode: true },
    });

    // Balances are created eagerly so later flows can lock an existing row
    // rather than racing to create one.
    await tx.customerBottleBalance.create({
      data: { customerId: profile.id },
    });

    await tx.customerRewardBalance.create({
      data: { customerId: profile.id },
    });

    if (referrer) {
      if (referrer.id === profile.id) {
        throw new BusinessRuleError("You cannot refer yourself.");
      }

      // PENDING until a qualifying order is placed and paid for. The unique
      // constraint on referredCustomerId makes this permanent.
      await tx.referral.create({
        data: {
          code: input.referralCode!,
          referrerCustomerId: referrer.id,
          referredCustomerId: profile.id,
          status: ReferralStatus.PENDING,
        },
      });

      await notify(
        {
          userId: referrer.userId,
          category: NotificationCategory.REFERRAL,
          title: "Someone joined using your referral code",
          body: `${user.fullName} signed up with your code. The referral counts once they complete a paid order.`,
          entityType: "CustomerProfile",
          entityId: profile.id,
          actionUrl: "/customer/referrals",
        },
        tx,
      );
    }

    await notify(
      {
        userId: user.id,
        category: NotificationCategory.ACCOUNT,
        title: "Welcome to F Net Water Hub",
        body: `Your customer number is ${profile.customerCode}. Add a delivery address to place your first order.`,
        actionUrl: "/customer/addresses",
      },
      tx,
    );

    await recordAudit(
      {
        userId: user.id,
        action: AUDIT_ACTIONS.userCreated,
        entityType: "User",
        entityId: user.id,
        newValues: {
          role: UserRole.CUSTOMER,
          customerCode: profile.customerCode,
          selfRegistered: true,
          referredBy: referrer?.id ?? null,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
      tx,
    );

    return { userId: user.id, role: user.role };
  });
}
