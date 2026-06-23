"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, LayoutDashboard, ListChecks, LogOut, Settings, ShieldCheck, UserRound, Sparkles, Menu, X, ChevronRight, Shield, Moon, Sun } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { api, clearToken, getToken, getCachedUser, subscribeUserCache } from "@/lib/api";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/lib/i18n";
import type { User } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/reservations", labelKey: "reservations", icon: ListChecks },
  { href: "/settings", labelKey: "settings", icon: Settings }
] as const;

const adminNavItem = { href: "/admin", labelKey: "admin", icon: ShieldCheck } as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(getCachedUser());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    return subscribeUserCache((updatedUser) => {
      setUser(updatedUser);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setIsNightMode(saved);
    if (saved) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleNightMode = () => {
    const next = !isNightMode;
    setIsNightMode(next);
    localStorage.setItem('darkMode', next.toString());
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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

  const displayName = user ? (user.displayName || `${user.firstName} ${user.lastName}`) : t.loading;
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` : "U";

  return (
    <div className="app-shell">
      {/* Mobile Top Bar */}
      <header className="app-mobile-header">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="app-mobile-menu-btn"
          aria-label={t.menu}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="app-mobile-header-right">
          <span className="app-mobile-title">{t.appName}</span>
          <LanguageSwitch variant={isNightMode ? "dark" : "default"} />
          <div className="app-avatar app-avatar--sm">
            <span>{initials}</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`app-sidebar ${isMenuOpen ? 'app-sidebar--open' : ''}`}>
        <div className="flex h-full flex-col px-5 py-6 overflow-y-auto dark:bg-slate-900/50">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-red-600/20">
              <Sparkles size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-slate-900 leading-tight tracking-tight dark:text-slate-100">{t.appName}</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t.appSubtitle}</span>
            </div>
          </div>

          {/* Profile card (cleaner design) */}
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100/80 dark:bg-slate-800/50 dark:ring-slate-700/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/50 text-sm font-bold text-slate-700 dark:bg-slate-700/50 dark:text-slate-300">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{displayName}</span>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Shield size={10} className="text-slate-400" />
                {user?.role ?? "user"}
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1.5">
            <span className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.menu}
            </span>
            {[...navItems, ...(user?.role === "admin" ? [adminNavItem] : [])].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-red-50 text-red-700 ring-1 ring-red-100 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900/30" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                  }`}
                >
                  <span className={`flex items-center justify-center rounded-lg p-1.5 transition-colors ${
                    isActive ? "bg-white text-red-600 shadow-sm dark:bg-red-900/40 dark:text-red-400" : "text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-200/50 dark:group-hover:text-slate-300 dark:group-hover:bg-slate-700/50"
                  }`}>
                    <Icon size={18} />
                  </span>
                  <span>{t[item.labelKey]}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-8 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">&copy; {new Date().getFullYear()} {t.appName}</span>
              <LanguageSwitch variant={isNightMode ? "dark" : "default"} />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={toggleNightMode} 
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-200/50 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
              >
                {isNightMode ? <Sun size={16} className="text-slate-400" /> : <Moon size={16} className="text-slate-400" />}
                <span>{isNightMode ? t.lightMode : t.darkMode}</span>
              </button>

              <button 
                onClick={logout} 
                className="flex items-center justify-center rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-red-50 hover:text-red-700 hover:ring-1 hover:ring-red-100 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:ring-red-900/30"
                title={t.logout}
              >
                <LogOut size={16} className="text-slate-400 transition-colors group-hover:text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="app-main-inner"
          >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="app-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
