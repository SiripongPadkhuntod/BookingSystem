"use client";

import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import type { User } from "@/lib/types";
import { ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.me().then(setUser);
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-red-700">{t.settings}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{t.accountSettingsTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">{t.accountSettingsDescription}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="card p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-700">
              <UserRound size={32} />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950">
              {user ? `${user.firstName} ${user.lastName}` : t.loading}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
            <div className="mt-5 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
              {user?.role ?? "user"}
            </div>
          </section>

          <section className="card p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="text-red-700" />
              <h2 className="text-xl font-semibold text-slate-950">{t.readinessTitle}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                t.jwtAuthentication,
                t.overlapProtection,
                t.roleReady,
                t.dockerCompose,
                t.typedApiClient,
                t.responsiveNavigation
              ].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
