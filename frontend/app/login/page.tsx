"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, CalendarCheck, MapPin, Clock, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { api, setToken } from "@/lib/api";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError(
        err instanceof Error
          ? err.message === "forbidden"
            ? t.accountDeactivated
            : err.message
          : t.loginFailed
      );
    } finally {
      setLoading(false);
    }
  };

  const featureCards = [
    { icon: CalendarCheck, label: "Schedule view", color: "#f59e0b" },
    { icon: MapPin, label: "Interactive map", color: "#3b82f6" },
    { icon: Clock, label: "Real-time status", color: "#10b981" },
    { icon: ShieldCheck, label: "RSU verified", color: "#ef4444" },
  ];

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-bg-orbs">
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-orb auth-orb--3" />
        <div className="auth-orb auth-orb--4" />
      </div>

      {/* Grain texture overlay */}
      <div className="auth-grain" />

      <div className="auth-container">
        {/* LEFT — Form */}
        <motion.section
          className="auth-form-section"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-glass-card">
            {/* Header */}
            <div className="auth-card-header">
              <div className="auth-logo-row">
                <div className="auth-logo-icon">
                  <Sparkles size={20} />
                </div>
                <span className="auth-logo-text">{t.appName}</span>
              </div>
              <LanguageSwitch variant="dark" />
            </div>

            <div className="auth-card-body">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="auth-badge">{t.appSubtitle}</span>
                <h1 className="auth-title">{t.loginTitle}</h1>
                <p className="auth-subtitle">{t.loginDescription}</p>
              </motion.div>

              <div className="auth-divider" />

              {error && <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

              {/* Form */}
              <motion.form
                onSubmit={submit}
                className="auth-form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="auth-field">
                  <label className="auth-label" htmlFor="login-identifier">{t.identifier}</label>
                  <div className="auth-input-wrap">
                    <Mail className="auth-input-icon" size={18} />
                    <input
                      id="login-identifier"
                      className="auth-input"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="login-password">{t.password}</label>
                  <div className="auth-input-wrap">
                    <LockKeyhole className="auth-input-icon" size={18} />
                    <input
                      id="login-password"
                      className="auth-input auth-input--password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="auth-spinner" />
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      {t.loginAction}
                    </>
                  )}
                </button>
              </motion.form>

              <p className="auth-switch-text">
                {t.noAccount}{" "}
                <Link href="/register" className="auth-switch-link">{t.createAccount}</Link>
              </p>
            </div>
          </div>
        </motion.section>

        {/* RIGHT — Visual showcase */}
        <motion.section
          className="auth-visual-section"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <div className="auth-visual-card">
            {/* Feature badges */}
            <div className="auth-feature-grid">
              {featureCards.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="auth-feature-chip"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="auth-feature-icon" style={{ background: `${item.color}20`, color: item.color }}>
                    <item.icon size={18} />
                  </div>
                  <span>{item.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Center illustration area */}
            <div className="auth-visual-center">
              <div className="auth-visual-glow" />
              <div className="auth-visual-seats">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`auth-seat ${i % 3 === 0 ? "auth-seat--booked" : i % 5 === 0 ? "auth-seat--pending" : "auth-seat--free"}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.05, type: "spring", damping: 15 }}
                  />
                ))}
              </div>
              <p className="auth-visual-seats-label">
                <span className="auth-dot auth-dot--free" /> Available
                <span className="auth-dot auth-dot--booked" /> Reserved
                <span className="auth-dot auth-dot--pending" /> Pending
              </p>
            </div>

            {/* Bottom text */}
            <div className="auth-visual-bottom">
              <h2 className="auth-visual-title">{t.loginVisualTitle}</h2>
              <p className="auth-visual-body">{t.loginVisualBody}</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
