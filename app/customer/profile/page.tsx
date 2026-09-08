import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { requireCustomer } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";

import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your contact details.",
};

export default async function CustomerProfilePage() {
  const actor = await requireCustomer();
  const profile = await prisma.customerProfile.findUnique({
    where: { id: actor.customerId },
    select: {
      ghanaDigitalAddress: true,
      customerCode: true,
      referralCode: true,
      user: { select: { fullName: true, email: true, phone: true } },
    },
  });

  if (!profile) {
    throw new Error(`Customer ${actor.customerId} is missing a profile.`);
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description={`${profile.customerCode} · ${profile.user.email}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            fullName={profile.user.fullName}
            phone={profile.user.phone}
            ghanaDigitalAddress={profile.ghanaDigitalAddress}
          />
        </CardContent>
      </Card>
    </>
  );
}
