import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { Card, CardContent } from "@/components/ui";
import { requireAdministrator } from "@/lib/auth/dal";
import { formatDateTime, humanizeEnum } from "@/lib/utils";
import { listSettings } from "@/services/admin/settings";

import { SettingForm } from "./setting-form";

export const metadata: Metadata = {
  title: "System settings",
  description: "Configurable business values stored in SystemSetting.",
};

function displayValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

export default async function AdminSettingsPage() {
  await requireAdministrator();
  const settings = await listSettings();

  const grouped = new Map<string, typeof settings>();
  for (const setting of settings) {
    const rows = grouped.get(setting.category) ?? [];
    rows.push(setting);
    grouped.set(setting.category, rows);
  }

  return (
    <>
      <PageHeader
        title="System settings"
        description="Business rules that can change without a deployment. Every save is audited."
      />

      <div className="space-y-6">
        {[...grouped.entries()].map(([category, rows]) => (
          <Card key={category}>
            <CardContent className="divide-y divide-slate-100 p-0">
              <div className="px-5 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {humanizeEnum(category)}
                </h2>
              </div>
              {rows.map((setting) => (
                <div
                  key={setting.id}
                  className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {setting.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {setting.description}
                    </p>
                    <p className="mt-2 font-mono text-xs text-slate-400">
                      {setting.key}
                      {setting.updatedByUser
                        ? ` · last saved by ${setting.updatedByUser.fullName} ${formatDateTime(setting.updatedAt)}`
                        : ""}
                    </p>
                  </div>
                  {setting.isEditable ? (
                    <SettingForm
                      id={setting.id}
                      type={setting.valueType}
                      defaultValue={displayValue(setting.value)}
                    />
                  ) : (
                    <p className="text-sm text-slate-600">
                      {displayValue(setting.value)}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
