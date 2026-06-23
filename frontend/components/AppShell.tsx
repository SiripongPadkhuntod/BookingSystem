"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, LayoutDashboard, ListChecks, LogOut, Settings, UserRound } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { api, clearToken, getToken } from "@/lib/api";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/lib/i18n";
import type { User } from "@/lib/types";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/reservations", labelKey: "reservations", icon: ListChecks },
  { href: "/settings", labelKey: "settings", icon: Settings }
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api.me().then(setUser).catch(() => {
      clearToken();
      router.replace("/login");
    });
  }, [router]);

  const logout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-[280px] border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-700 font-bold text-white">R</div>
          <div>
            <div className="font-semibold text-slate-950">{t.appName}</div>
            <div className="text-xs text-slate-500">{t.appSubtitle}</div>
          </div>
        </div>

        <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-red-700">
              <UserRound size={20} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {user ? `${user.firstName} ${user.lastName}` : t.loading}
              </div>
              <div className="text-xs uppercase text-slate-500">{user?.role ?? "user"}</div>
            </div>
          </div>
        </div>

        <nav className="mt-7 space-y-1.5">
          <div className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t.menu}</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-transparent text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-white text-red-700" : "bg-slate-100 text-slate-500"}`}>
                  <Icon size={18} />
                </span>
                {t[item.labelKey]}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <LanguageSwitch />
        </div>

        <button onClick={logout} className="button-secondary mt-4 flex items-center justify-center gap-2 px-4 py-3">
          <LogOut size={18} />
          {t.logout}
        </button>
      </aside>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarDays size={20} className="text-red-700" />
            {t.appName}
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitch />
            <button onClick={logout} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">
              {t.logoutShort}
            </button>
          </div>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold ${
                pathname === item.href ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200 text-slate-600"
              }`}
            >
              {t[item.labelKey]}
            </Link>
          ))}
        </nav>
      </header>

      <main className="min-h-screen lg:pl-[280px]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
