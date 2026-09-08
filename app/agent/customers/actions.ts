"use server";

import { redirect, unstable_rethrow } from "next/navigation";

import { requireAgent } from "@/lib/auth/dal";
import { toSafeError } from "@/lib/errors";
import { formDataToObject, registerSchema, toFieldErrors } from "@/lib/validation";
import { registerCustomer } from "@/services/customers/register";

export type AgentRegisterState =
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }
  | undefined;

export async function registerAgentCustomer(
  _state: AgentRegisterState,
  formData: FormData,
): Promise<AgentRegisterState> {
  const actor = await requireAgent();
  const parsed = registerSchema.safeParse({
    ...formDataToObject(formData),
    acceptTerms: "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  try {
    const result = await registerCustomer(parsed.data, {
      registeredByAgentId: actor.agentId,
    });
    redirect(`/agent/customers/${result.customerId}`);
  } catch (error) {
    unstable_rethrow(error);
    const safe = toSafeError(error);
    return { ok: false, message: safe.message, fieldErrors: safe.fieldErrors };
  }
}
