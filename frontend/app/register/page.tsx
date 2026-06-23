"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, User, Phone, ShieldCheck, MapPin, CheckCircle, CalendarCheck, Clock, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { api, setToken } from "@/lib/api";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";

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
  const [showPassword, setShowPassword] = useState(false);
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

  const featureCards = [
    { icon: CheckCircle, label: "Fast & Easy", color: "#10b981", desc: "Book in seconds" },
    { icon: MapPin, label: "Campus Map", color: "#3b82f6", desc: "Find rooms easily" },
    { icon: Clock, label: "24/7 Access", color: "#f59e0b", desc: "Always available" },
    { icon: ShieldCheck, label: "RSU Secure", color: "#ef4444", desc: "Verified access" },
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

      {/* Grain texture */}
      <div className="auth-grain" />

      <div className="auth-container">
        {/* LEFT — Form */}
        <motion.section
          className="auth-form-section"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-glass-card" style={{ maxWidth: "600px", marginTop: "2rem", marginBottom: "2rem" }}>
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
                <h1 className="auth-title">{t.registerTitle}</h1>
                <p className="auth-subtitle">{t.registerDescription}</p>
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
                <div className="auth-field-row">
                  <div className="auth-field">
                    <label className="auth-label">{t.firstName}</label>
                    <div className="auth-input-wrap">
                      <User className="auth-input-icon" size={18} />
                      <input
                        className="auth-input"
                        type="text"
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">{t.lastName}</label>
                    <div className="auth-input-wrap">
                      <User className="auth-input-icon" size={18} />
                      <input
                        className="auth-input"
                        type="text"
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">{t.username}</label>
                  <div className="auth-input-wrap">
                    <User className="auth-input-icon" size={18} />
                    <input
                      className="auth-input"
                      type="text"
                      value={form.username}
                      onChange={(e) => update("username", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-row">
                  <div className="auth-field">
                    <label className="auth-label">{t.email}</label>
                    <div className="auth-input-wrap">
                      <Mail className="auth-input-icon" size={18} />
                      <input
                        className="auth-input"
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">{t.studentId}</label>
                    <div className="auth-input-wrap">
                      <Phone className="auth-input-icon" size={18} />
                      <input
                        className="auth-input"
                        type="text"
                        value={form.studentId}
                        onChange={(e) => update("studentId", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">{t.password}</label>
                  <div className="auth-input-wrap">
                    <LockKeyhole className="auth-input-icon" size={18} />
                    <input
                      className="auth-input auth-input--password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      required
                      minLength={8}
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
                      {t.createAccount}
                    </>
                  )}
                </button>
              </motion.form>

              <p className="auth-switch-text">
                {t.accountPrompt}{" "}
                <Link href="/login" className="auth-switch-link">{t.loginAction}</Link>
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
            <div className="auth-register-features">
              {featureCards.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="auth-register-feature"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="auth-register-feature-icon" style={{ background: `${item.color}20`, color: item.color }}>
                    <item.icon size={22} />
                  </div>
                  <div>
                    <h4 className="auth-register-feature-title">{item.label}</h4>
                    <p className="auth-register-feature-desc">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Center illustration area */}
            <div className="auth-visual-center">
              <div className="auth-visual-glow auth-visual-glow--blue" />
              <div className="auth-visual-seats auth-visual-seats--register">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`auth-seat ${i % 4 === 0 ? "auth-seat--booked" : i % 3 === 0 ? "auth-seat--pending" : "auth-seat--free"}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.03, type: "spring", damping: 15 }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom text */}
            <div className="auth-visual-bottom">
              <h2 className="auth-visual-title">{t.registerVisualTitle || "Join Booking System"}</h2>
              <p className="auth-visual-body">{t.registerVisualBody || "Register your account to manage your bookings and find the perfect spot."}</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
