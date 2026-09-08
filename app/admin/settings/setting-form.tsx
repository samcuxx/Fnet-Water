"use client";

import { useActionState } from "react";

import { Button, Input } from "@/components/ui";
import { SettingValueType } from "@/lib/generated/prisma/enums";

import { saveSetting, type SettingFormState } from "./actions";

export function SettingForm({
  id,
  type,
  defaultValue,
}: {
  id: string;
  type: SettingValueType;
  defaultValue: string;
}) {
  const [state, formAction, pending] = useActionState<SettingFormState, FormData>(
    saveSetting,
    undefined,
  );

  return (
    <form action={formAction} className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="id" value={id} />
      {type === SettingValueType.BOOLEAN ? (
        <select
          name="value"
          defaultValue={defaultValue}
          className="h-10 w-full rounded-lg border border-slate-300 bg-surface px-3 text-sm sm:w-40"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      ) : type === SettingValueType.JSON ? (
        <textarea
          name="value"
          defaultValue={defaultValue}
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-surface px-3 py-2 font-mono text-xs"
        />
      ) : (
        <Input name="value" defaultValue={defaultValue} className="sm:max-w-xs" />
      )}
      <Button type="submit" size="sm" isLoading={pending} loadingText="Saving…">
        Save
      </Button>
      {state?.message && (
        <p
          className={
            state.ok ? "text-xs text-success-600" : "text-xs text-danger-600"
          }
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
