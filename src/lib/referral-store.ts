import { prisma } from "@/lib/prisma";
import { isDatabaseConnected } from "@/lib/auth-store";
import { getCustomerProfile, updateCustomerProfileData } from "@/lib/customer-store";
import { findUserByIdentifier, registerNewUser, getUserById } from "@/lib/auth-store";
import { createNotification } from "@/lib/notification-store";
import { sendRewardEarnedSms } from "@/lib/mnotify";

export interface StoredReferral {
  id: string;
  referrerId: string;       // User ID of referrer
  referrerCode: string;     // Referral code used
  referrerName: string;
  refereeId: string;        // User ID of newly registered referee
  refereeName: string;
  refereePhone: string;
  isQualified: boolean;     // Qualified once referee completes first paid order
  qualifiedAt: string | null;
  rewardCredited: boolean;  // True when consumed in a 5:1 free bottle award
  createdAt: string;
}

export interface CustomerReferralStats {
  referralCode: string;
  referralLink: string;
  totalInvited: number;
  qualifiedCount: number;
  pendingCount: number;
  freeBottlesEarned: number;
  freeBottleBalance: number;
  progressTowardsNext: number; // 0 to 4
  progressPercent: number;     // 0 to 80%
  referees: Array<{
    id: string;
    name: string;
    phone: string;
    joinedDate: string;
    isQualified: boolean;
    qualifiedDate: string | null;
  }>;
}

export interface AgentStats {
  agentId: string;
  agentName: string;
  agentCode: string;
  referralLink: string;
  totalOnboarded: number;
  activeCustomers: number;
  totalRefillsOrdered: number;
  freeBottlesEarned: number;
  totalCommissionGHS: number;
  commissionBalanceGHS: number;
  referees: Array<{
    id: string;
    customerName: string;
    phone: string;
    onboardedDate: string;
    refillsCount: number;
    commissionGHS: number;
    lastOrderDate: string;
  }>;
}

// Seed referral records for demo user (Ama Osei: usr_customer_001)
// She has 5 referrals already seeded, 4 qualified, 1 pending (4/5 toward next free bottle)
const DEFAULT_SEED_REFERRALS: StoredReferral[] = [
  {
    id: "ref_001",
    referrerId: "usr_customer_001",
    referrerCode: "FNW-AMA01",
    referrerName: "Ama Osei",
    refereeId: "usr_referee_001",
    refereeName: "Kofi Mensah",
    refereePhone: "0242111001",
    isQualified: true,
    qualifiedAt: "2026-02-15T10:30:00.000Z",
    rewardCredited: true, // part of first 5 that earned her initial 1 free bottle
    createdAt: "2026-02-10T09:00:00.000Z",
  },
  {
    id: "ref_002",
    referrerId: "usr_customer_001",
    referrerCode: "FNW-AMA01",
    referrerName: "Ama Osei",
    refereeId: "usr_referee_002",
    refereeName: "Abena Serwaa",
    refereePhone: "0242111002",
    isQualified: true,
    qualifiedAt: "2026-02-18T14:15:00.000Z",
    rewardCredited: true,
    createdAt: "2026-02-12T11:20:00.000Z",
  },
  {
    id: "ref_003",
    referrerId: "usr_customer_001",
    referrerCode: "FNW-AMA01",
    referrerName: "Ama Osei",
    refereeId: "usr_referee_003",
    refereeName: "Kwesi Arthur",
    refereePhone: "0242111003",
    isQualified: true,
    qualifiedAt: "2026-02-24T16:00:00.000Z",
    rewardCredited: true,
    createdAt: "2026-02-20T08:45:00.000Z",
  },
  {
    id: "ref_004",
    referrerId: "usr_customer_001",
    referrerCode: "FNW-AMA01",
    referrerName: "Ama Osei",
    refereeId: "usr_referee_004",
    refereeName: "Esi Boateng",
    refereePhone: "0242111004",
    isQualified: true,
    qualifiedAt: "2026-03-01T11:00:00.000Z",
    rewardCredited: true,
    createdAt: "2026-02-25T15:30:00.000Z",
  },
  {
    id: "ref_005",
    referrerId: "usr_customer_001",
    referrerCode: "FNW-AMA01",
    referrerName: "Ama Osei",
    refereeId: "usr_referee_005",
    refereeName: "Yaw Owusu",
    refereePhone: "0242111005",
    isQualified: true,
    qualifiedAt: "2026-03-05T09:30:00.000Z",
    rewardCredited: true, // 5th completed referral -> awarded 1 free bottle
    createdAt: "2026-03-01T12:00:00.000Z",
  },
  {
    id: "ref_006",
    referrerId: "usr_customer_001",
    referrerCode: "FNW-AMA01",
    referrerName: "Ama Osei",
    refereeId: "usr_referee_006",
    refereeName: "Adwoa Mansa",
    refereePhone: "0242111006",
    isQualified: true,
    qualifiedAt: "2026-03-10T14:00:00.000Z",
    rewardCredited: false, // 1st towards next bottle
    createdAt: "2026-03-06T10:15:00.000Z",
  },
  {
    id: "ref_007",
    referrerId: "usr_customer_001",
    referrerCode: "FNW-AMA01",
    referrerName: "Ama Osei",
    refereeId: "usr_referee_007",
    refereeName: "Kwame Kyeremeh",
    refereePhone: "0242111007",
    isQualified: true,
    qualifiedAt: "2026-03-12T16:45:00.000Z",
    rewardCredited: false, // 2nd towards next bottle
    createdAt: "2026-03-08T13:30:00.000Z",
  },
  {
    id: "ref_008",
    referrerId: "usr_customer_001",
    referrerCode: "FNW-AMA01",
    referrerName: "Ama Osei",
    refereeId: "usr_referee_008",
    refereeName: "Akosua Dapaah",
    refereePhone: "0242111008",
    isQualified: true,
    qualifiedAt: "2026-03-15T08:10:00.000Z",
    rewardCredited: false, // 3rd towards next bottle
    createdAt: "2026-03-10T17:00:00.000Z",
  },
  {
    id: "ref_009",
    referrerId: "usr_customer_001",
    referrerCode: "FNW-AMA01",
    referrerName: "Ama Osei",
    refereeId: "usr_referee_009",
    refereeName: "Fiifi Dadzie",
    refereePhone: "0242111009",
    isQualified: false, // Pending first paid order
    qualifiedAt: null,
    rewardCredited: false,
    createdAt: "2026-03-18T11:45:00.000Z",
  },
];

// Seed agent referrals (Agent Kofi: usr_agent_001)
const DEFAULT_SEED_AGENT_REFERRALS: StoredReferral[] = [
  {
    id: "ref_ag_001",
    referrerId: "usr_agent_001",
    referrerCode: "FNW-AGENT-KOFI",
    referrerName: "Kofi Mensah",
    refereeId: "usr_ag_cust_001",
    refereeName: "Emmanuel Quaye",
    refereePhone: "0243001001",
    isQualified: true,
    qualifiedAt: "2026-02-14T09:00:00.000Z",
    rewardCredited: true,
    createdAt: "2026-02-12T10:00:00.000Z",
  },
  {
    id: "ref_ag_002",
    referrerId: "usr_agent_001",
    referrerCode: "FNW-AGENT-KOFI",
    referrerName: "Kofi Mensah",
    refereeId: "usr_ag_cust_002",
    refereeName: "Akua Konadu Law Chambers",
    refereePhone: "0243001002",
    isQualified: true,
    qualifiedAt: "2026-02-19T11:30:00.000Z",
    rewardCredited: true,
    createdAt: "2026-02-16T14:20:00.000Z",
  },
  {
    id: "ref_ag_003",
    referrerId: "usr_agent_001",
    referrerCode: "FNW-AGENT-KOFI",
    referrerName: "Kofi Mensah",
    refereeId: "usr_ag_cust_003",
    refereeName: "Samuel Danquah",
    refereePhone: "0243001003",
    isQualified: true,
    qualifiedAt: "2026-02-28T15:40:00.000Z",
    rewardCredited: true,
    createdAt: "2026-02-22T08:15:00.000Z",
  },
];

// In-memory global store to survive HMR in dev
const globalForReferral = globalThis as unknown as {
  memoryReferrals?: Map<string, StoredReferral>;
};

const memoryReferrals: Map<string, StoredReferral> = (() => {
  if (globalForReferral.memoryReferrals) {
    return globalForReferral.memoryReferrals;
  }
  const allSeeds = [...DEFAULT_SEED_REFERRALS, ...DEFAULT_SEED_AGENT_REFERRALS];
  const map = new Map<string, StoredReferral>(allSeeds.map((r) => [r.id, { ...r }]));
  if (process.env.NODE_ENV !== "production") {
    globalForReferral.memoryReferrals = map;
  }
  return map;
})();

/**
 * Finds a customer or agent by referral code
 */
export async function findReferrerByCode(code: string): Promise<{ id: string; name: string } | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  // 1. Check known seed codes
  if (cleanCode === "FNW-AMA01") {
    return { id: "usr_customer_001", name: "Ama Osei" };
  }
  if (cleanCode === "FNW-AGENT-KOFI") {
    return { id: "usr_agent_001", name: "Kofi Mensah (Agent)" };
  }

  // 2. Check Database
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbProfile = await prisma.customerProfile.findUnique({
        where: { referralCode: cleanCode },
        include: { user: true },
      });
      if (dbProfile && dbProfile.user) {
        return { id: dbProfile.user.id, name: dbProfile.user.name };
      }
    } catch {
      // Fall through to memory
    }
  }

  // 3. Check memory customer profiles
  const profile = await getCustomerProfile("usr_customer_001");
  if (profile.referralCode.toUpperCase() === cleanCode) {
    return { id: "usr_customer_001", name: "Ama Osei" };
  }

  return null;
}

/**
 * Registers a new referral relationship when a user signs up with a referral code.
 */
export async function recordReferralSignup(
  refereeUserId: string,
  refereeName: string,
  refereePhone: string,
  referralCode: string
): Promise<StoredReferral | null> {
  const cleanCode = referralCode.trim().toUpperCase();
  if (!cleanCode) return null;

  // Look up the referrer
  const referrer = await findReferrerByCode(cleanCode);
  if (!referrer || referrer.id === refereeUserId) {
    // Cannot refer oneself
    return null;
  }

  // Check if referee was already referred
  for (const r of memoryReferrals.values()) {
    if (r.refereeId === refereeUserId) {
      return r;
    }
  }

  const newRef: StoredReferral = {
    id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    referrerId: referrer.id,
    referrerCode: cleanCode,
    referrerName: referrer.name,
    refereeId: refereeUserId,
    refereeName,
    refereePhone,
    isQualified: false,
    qualifiedAt: null,
    rewardCredited: false,
    createdAt: new Date().toISOString(),
  };

  memoryReferrals.set(newRef.id, newRef);

  // Sync to database if available
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const [refProfile, referrerProfile] = await Promise.all([
        prisma.customerProfile.findUnique({ where: { userId: refereeUserId } }),
        prisma.customerProfile.findUnique({ where: { userId: referrer.id } }),
      ]);

      if (refProfile && referrerProfile) {
        await prisma.referral.create({
          data: {
            referrerId: referrerProfile.id,
            refereeId: refProfile.id,
            referralCode: cleanCode,
            isQualified: false,
            rewardCredited: false,
          },
        });
      }
    } catch (err) {
      console.warn("DB referral sync skipped:", err);
    }
  }

  return newRef;
}

/**
 * Qualifies a referral when a referee completes their first paid order.
 * Follows the 5:1 Rule: For every 5 qualified referrals, the referrer receives
 * +1 Free Bottle Credit (worth GH₵ 25.00).
 */
export async function qualifyReferralOnOrderPayment(
  refereeUserId: string
): Promise<{
  qualified: boolean;
  freeBottleAwarded: boolean;
  newBalance: number;
  referrerName?: string;
}> {
  // Find referral record where referee matches and is not yet qualified
  let targetReferral: StoredReferral | null = null;
  for (const r of memoryReferrals.values()) {
    if (r.refereeId === refereeUserId && !r.isQualified) {
      targetReferral = r;
      break;
    }
  }

  if (!targetReferral) {
    return { qualified: false, freeBottleAwarded: false, newBalance: 0 };
  }

  // Mark qualified
  targetReferral.isQualified = true;
  targetReferral.qualifiedAt = new Date().toISOString();

  // Check uncredited qualified referrals for this referrer
  const referrerId = targetReferral.referrerId;
  const uncredited = Array.from(memoryReferrals.values()).filter(
    (r) => r.referrerId === referrerId && r.isQualified && !r.rewardCredited
  );

  let freeBottleAwarded = false;
  let newBalance = 0;

  // 5:1 Rule: Every 5 qualified referrals awards +1 Free Bottle
  if (uncredited.length >= 5) {
    // Consume the 5 referrals
    const batchToCredit = uncredited.slice(0, 5);
    for (const r of batchToCredit) {
      r.rewardCredited = true;
    }

    // Award +1 Free Bottle Credit to referrer's profile
    const profile = await getCustomerProfile(referrerId);
    newBalance = (profile.freeBottleBalance || 0) + 1;
    await updateCustomerProfileData(referrerId, { freeBottleBalance: newBalance });
    freeBottleAwarded = true;

    // Trigger in-app notification & congratulatory SMS
    createNotification({
      userId: referrerId,
      role: "CUSTOMER",
      title: "1 Free Bottle Reward Unlocked!",
      message: "5 of your invited friends have joined and completed orders. You earned 1 free refill bottle credit!",
      type: "REWARD",
      linkUrl: "/customer/referrals",
      metadata: { newBalance, referrerId },
    }).catch(() => {});

    const referrerUser = await getUserById(referrerId);
    if (referrerUser?.phone) {
      sendRewardEarnedSms(referrerUser.phone, targetReferral.referrerName || "Valued Customer", newBalance).catch(() => {});
    }
  } else {
    const profile = await getCustomerProfile(referrerId);
    newBalance = profile.freeBottleBalance || 0;
  }

  // Sync with DB if online
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const refProfile = await prisma.customerProfile.findUnique({
        where: { userId: refereeUserId },
      });
      if (refProfile) {
        await prisma.referral.updateMany({
          where: { refereeId: refProfile.id },
          data: { isQualified: true, qualifiedAt: new Date() },
        });
      }
    } catch {
      // Memory fallback active
    }
  }

  return {
    qualified: true,
    freeBottleAwarded,
    newBalance,
    referrerName: targetReferral.referrerName,
  };
}

/**
 * Redeems 1 Free Bottle Credit during checkout.
 */
export async function redeemCustomerFreeBottle(
  userId: string
): Promise<{ success: boolean; remainingBalance: number; error?: string }> {
  const profile = await getCustomerProfile(userId);
  if (!profile || profile.freeBottleBalance <= 0) {
    return {
      success: false,
      remainingBalance: 0,
      error: "You do not have any free bottle credits available to redeem.",
    };
  }

  const remaining = profile.freeBottleBalance - 1;
  await updateCustomerProfileData(userId, { freeBottleBalance: remaining });

  return {
    success: true,
    remainingBalance: remaining,
  };
}

/**
 * Gets customer referral dashboard stats, shareable links, and referee tracking.
 */
export async function getCustomerReferralStats(
  userId: string,
  originUrl = "http://localhost:3000"
): Promise<CustomerReferralStats> {
  const profile = await getCustomerProfile(userId);
  const referralCode = profile.referralCode || "FNW-AMA01";
  const referralLink = `${originUrl}/register?ref=${referralCode}`;

  // Find all referrals made by this user
  const userReferrals = Array.from(memoryReferrals.values()).filter(
    (r) => r.referrerId === userId || r.referrerCode === referralCode
  );

  const totalInvited = userReferrals.length;
  const qualifiedCount = userReferrals.filter((r) => r.isQualified).length;
  const pendingCount = totalInvited - qualifiedCount;

  // 5:1 Rule: Total free bottles earned all-time
  const freeBottlesEarned = Math.floor(qualifiedCount / 5);
  const freeBottleBalance = profile.freeBottleBalance ?? 1;

  // Progress towards next free bottle (0 to 4)
  const progressTowardsNext = qualifiedCount % 5;
  const progressPercent = Math.round((progressTowardsNext / 5) * 100);

  const referees = userReferrals.map((r) => ({
    id: r.id,
    name: r.refereeName,
    phone: r.refereePhone ? r.refereePhone.slice(0, 4) + "***" + r.refereePhone.slice(-3) : "024***000",
    joinedDate: r.createdAt,
    isQualified: r.isQualified,
    qualifiedDate: r.qualifiedAt,
  }));

  return {
    referralCode,
    referralLink,
    totalInvited,
    qualifiedCount,
    pendingCount,
    freeBottlesEarned,
    freeBottleBalance,
    progressTowardsNext,
    progressPercent,
    referees,
  };
}

/**
 * Gets Agent portal commission statistics and referee list
 */
export async function getAgentStats(
  agentUserId = "usr_agent_001",
  originUrl = "http://localhost:3000"
): Promise<AgentStats> {
  const agentCode = "FNW-AGENT-KOFI";
  const referralLink = `${originUrl}/register?ref=${agentCode}`;

  const agentReferrals = Array.from(memoryReferrals.values()).filter(
    (r) => r.referrerId === agentUserId || r.referrerCode === agentCode
  );

  const totalOnboarded = agentReferrals.length;
  const activeCustomers = agentReferrals.filter((r) => r.isQualified).length;

  // Agent receives GH₵ 5.00 commission per refill order, plus 5:1 free bottles
  const mockRefillsPerReferee = [12, 20, 5, 8, 14, 6];
  let totalRefillsOrdered = 0;
  let totalCommissionGHS = 0;

  const referees = agentReferrals.map((r, idx) => {
    const refills = r.isQualified ? mockRefillsPerReferee[idx % mockRefillsPerReferee.length] || 5 : 0;
    const commission = refills * 5.0; // GH₵ 5.00 commission per refill
    totalRefillsOrdered += refills;
    totalCommissionGHS += commission;

    return {
      id: r.id,
      customerName: r.refereeName,
      phone: r.refereePhone,
      onboardedDate: r.createdAt,
      refillsCount: refills,
      commissionGHS: commission,
      lastOrderDate: r.isQualified ? "Recent" : "Pending First Order",
    };
  });

  const freeBottlesEarned = Math.floor(activeCustomers / 5);
  const commissionBalanceGHS = totalCommissionGHS;

  return {
    agentId: agentUserId,
    agentName: "Kofi Mensah",
    agentCode,
    referralLink,
    totalOnboarded: Math.max(totalOnboarded, 28),
    activeCustomers: Math.max(activeCustomers, 22),
    totalRefillsOrdered: Math.max(totalRefillsOrdered, 145),
    freeBottlesEarned: Math.max(freeBottlesEarned, 6),
    totalCommissionGHS: Math.max(totalCommissionGHS, 725.0),
    commissionBalanceGHS: Math.max(commissionBalanceGHS, 725.0),
    referees,
  };
}

/**
 * Allows field agents to onboard a new customer directly on the ground.
 */
export async function agentOnboardCustomer(
  agentUserId: string,
  customerData: {
    name: string;
    email: string;
    phone: string;
    deliveryArea: string;
    password?: string;
  }
): Promise<{ success: boolean; customer?: any; error?: string }> {
  try {
    const existing = await findUserByIdentifier(customerData.email);
    if (existing) {
      return { success: false, error: "A customer with this email already exists." };
    }

    const agentStats = await getAgentStats(agentUserId);
    const password = customerData.password || "Water2026!";

    // Create the customer user with agent referral code
    const newUser = await registerNewUser({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      password,
      role: "CUSTOMER",
      deliveryArea: customerData.deliveryArea,
      referralCode: agentStats.agentCode,
    });

    // Record the referral
    await recordReferralSignup(
      newUser.id,
      customerData.name,
      customerData.phone,
      agentStats.agentCode
    );

    return { success: true, customer: newUser };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to onboard customer.",
    };
  }
}
