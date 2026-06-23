"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { api, setToken } from "@/lib/api";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.login({ identifier, password });
      setToken(result.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="card p-6 sm:p-8">
          <div className="mb-6 flex justify-end">
            <LanguageSwitch />
          </div>
          <div className="mb-8">
            <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              RSU Booking System
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t.loginTitle}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.loginDescription}</p>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{t.identifier}</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="field px-10 py-3" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{t.password}</span>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="field px-10 py-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
            </label>

            <button className="button-primary w-full px-4 py-3" disabled={loading}>
              {loading ? t.loginLoading : t.loginAction}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {t.noAccount}{" "}
            <Link className="font-semibold text-red-700 hover:underline" href="/register">
              {t.createAccount}
            </Link>
          </p>
        </section>

        <section className="card hidden min-h-[620px] overflow-hidden lg:block">
          <div className="flex h-full flex-col justify-between p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 text-white">
                <CalendarCheck />
              </div>
              <div>
                <div className="font-semibold text-slate-950">{t.loginVisualTitle}</div>
                <div className="text-sm text-slate-500">{t.loginVisualSubtitle}</div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 30 }).map((_, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-xl border ${
                    index % 7 === 0 ? "border-red-200 bg-red-50" : index % 5 === 0 ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
                  }`}
                />
              ))}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{t.loginVisualHeading}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{t.loginVisualBody}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
