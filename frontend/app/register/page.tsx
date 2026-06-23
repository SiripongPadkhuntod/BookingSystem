"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { api, setToken } from "@/lib/api";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/lib/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    studentId: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.register(form);
      setToken(result.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card w-full max-w-3xl p-6 sm:p-8">
        <div className="mb-6 flex justify-end">
          <LanguageSwitch />
        </div>
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 text-white">
            <UserPlus />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t.registerTitle}</h1>
            <p className="mt-2 text-sm text-slate-600">{t.registerDescription}</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t.username}</span>
            <input className="field px-4 py-3" value={form.username} onChange={(event) => update("username", event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t.email}</span>
            <input className="field px-4 py-3" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t.firstName}</span>
            <input className="field px-4 py-3" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t.lastName}</span>
            <input className="field px-4 py-3" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t.studentId}</span>
            <input className="field px-4 py-3" value={form.studentId} onChange={(event) => update("studentId", event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t.password}</span>
            <input className="field px-4 py-3" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required minLength={8} />
          </label>
          <div className="sm:col-span-2">
            <button className="button-primary w-full px-4 py-3" disabled={loading}>
              {loading ? t.registerLoading : t.createAccount}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {t.accountPrompt}{" "}
          <Link className="font-semibold text-red-700 hover:underline" href="/login">
            {t.loginAction}
          </Link>
        </p>
      </section>
    </main>
  );
}
