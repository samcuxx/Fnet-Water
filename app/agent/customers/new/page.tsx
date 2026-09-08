import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { Card, CardContent } from "@/components/ui";
import { requireAgent } from "@/lib/auth/dal";

import { AgentRegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Register customer",
  description: "Onboard a customer onto your book.",
};

export default async function AgentRegisterCustomerPage() {
  await requireAgent();

  return (
    <>
      <PageHeader
        title="Register customer"
        description="Creates their account, bottle balance and reward balance."
      />
      <Card>
        <CardContent className="pt-6">
          <AgentRegisterForm />
        </CardContent>
      </Card>
    </>
  );
}
