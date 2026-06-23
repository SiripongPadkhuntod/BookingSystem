"use client";

import { AppShell } from "@/components/AppShell";
import { Toast } from "@/components/Toast";
import { api, clearToken } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import type { User, Reservation } from "@/lib/types";
import { ShieldCheck, UserRound, Lock, UserCog, Settings as SettingsIcon, AlertTriangle, KeyRound, Globe, LogOut, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences" | "danger">("profile");
  
  const [toastMessage, setToastMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Profile Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [studentId, setStudentId] = useState("");

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password Strength
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (!password) return score;
    if (password.length > 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z\d]/.test(password)) score += 1;
    return score;
  };
  const passwordStrength = calculatePasswordStrength(newPassword);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-slate-200", "bg-red-500", "bg-orange-500", "bg-amber-400", "bg-emerald-500"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const u = await api.me();
      setUser(u);
      setFirstName(u.firstName);
      setLastName(u.lastName);
      setDepartment(u.department);
      setStudentId(u.studentId);

      const res = await api.myReservations();
      setReservations(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const u = await api.updateProfile({ firstName, lastName, department, studentId });
      setUser(u);
      setToastMessage("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const requestPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (passwordStrength < 2) {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }
    setError("");
    setShowPasswordModal(true);
  };

  const executePasswordChange = async () => {
    setShowPasswordModal(false);
    setSaving(true);
    setError("");
    try {
      await api.changePassword({ currentPassword, newPassword });
      setToastMessage("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate your account? This action cannot be undone and you will be logged out immediately.")) return;
    
    try {
      await api.deactivateAccount();
      clearToken();
      router.push("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate account");
    }
  };

  // Stats
  const activeBookings = reservations.filter(r => r.status === "confirmed").length;
  const cancelledBookings = reservations.filter(r => r.status === "cancelled").length;
  const totalBookings = reservations.length;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-red-700">{t.settings}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{t.accountSettingsTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your account preferences and security</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <div className="space-y-2">
            <button
              onClick={() => { setActiveTab("profile"); setError(""); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${activeTab === "profile" ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <UserCog size={18} />
              Profile details
            </button>
            <button
              onClick={() => { setActiveTab("security"); setError(""); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${activeTab === "security" ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <KeyRound size={18} />
              Security
            </button>
            <button
              onClick={() => { setActiveTab("preferences"); setError(""); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${activeTab === "preferences" ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <SettingsIcon size={18} />
              Preferences
            </button>
            <button
              onClick={() => { setActiveTab("danger"); setError(""); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${activeTab === "danger" ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <AlertTriangle size={18} />
              Danger zone
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {activeTab === "profile" && (
              <>
                <section className="card p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                      <UserRound size={32} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-950">
                        {user ? `${user.firstName} ${user.lastName}` : t.loading}
                      </h2>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                      <div className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                        {user?.role ?? "user"}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="card p-5 text-center">
                    <div className="text-2xl font-bold text-slate-950">{totalBookings}</div>
                    <div className="text-xs font-semibold text-slate-500">Total Bookings</div>
                  </div>
                  <div className="card p-5 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{activeBookings}</div>
                    <div className="text-xs font-semibold text-slate-500">Confirmed</div>
                  </div>
                  <div className="card p-5 text-center">
                    <div className="text-2xl font-bold text-red-600">{cancelledBookings}</div>
                    <div className="text-xs font-semibold text-slate-500">Cancelled</div>
                  </div>
                </div>

                <section className="card p-6">
                  <h3 className="mb-5 text-lg font-semibold text-slate-950">Update Profile</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-sm font-semibold text-slate-700">First Name</span>
                        <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="field w-full px-3 py-2" />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-semibold text-slate-700">Last Name</span>
                        <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="field w-full px-3 py-2" />
                      </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-sm font-semibold text-slate-700">Student ID</span>
                        <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} className="field w-full px-3 py-2" />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-semibold text-slate-700">Department</span>
                        <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="field w-full px-3 py-2" />
                      </label>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button type="submit" disabled={saving} className="button-primary px-5 py-2.5 text-sm">
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </section>
              </>
            )}

            {activeTab === "security" && (
              <section className="card p-6 relative">
                <div className="mb-5 flex items-center gap-3">
                  <Lock className="text-red-700" size={24} />
                  <h3 className="text-lg font-semibold text-slate-950">Change Password</h3>
                </div>
                <form onSubmit={requestPasswordChange} className="space-y-4 max-w-md">
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">Current Password</span>
                    <div className="relative">
                      <input type={showCurrentPassword ? "text" : "password"} required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="field w-full px-3 py-2 pr-10" />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">New Password</span>
                    <div className="relative">
                      <input type={showNewPassword ? "text" : "password"} required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="field w-full px-3 py-2 pr-10" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1.5">
                          {[1, 2, 3, 4].map(level => (
                            <div key={level} className={`h-full flex-1 rounded-full ${passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        <div className="mt-1 text-xs text-right font-semibold text-slate-500">
                          {strengthLabels[passwordStrength]}
                        </div>
                      </div>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">Confirm New Password</span>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="field w-full px-3 py-2 pr-10" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>

                  <div className="pt-2">
                    <button type="submit" disabled={saving} className="button-primary px-5 py-2.5 text-sm">
                      {saving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>

                {/* Password Change Confirmation Modal */}
                {showPasswordModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                      <h3 className="text-lg font-bold text-slate-900">Confirm Password Change</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Are you sure you want to change your password? You will need to use your new password the next time you log in.
                      </p>
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() => setShowPasswordModal(false)}
                          disabled={saving}
                          className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={executePasswordChange}
                          disabled={saving}
                          className="button-primary px-4 py-2 text-sm"
                        >
                          {saving ? "Confirming..." : "Yes, change it"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === "preferences" && (
              <section className="card p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Globe className="text-red-700" size={24} />
                  <h3 className="text-lg font-semibold text-slate-950">Language & Region</h3>
                </div>
                <div className="max-w-md space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">Display Language</span>
                    <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="field w-full px-3 py-2"
                    >
                      <option value="th">ภาษาไทย (Thai)</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                  <p className="text-xs text-slate-500">Changes the language of the application interface immediately.</p>
                </div>
              </section>
            )}

            {activeTab === "danger" && (
              <section className="card border-red-200 bg-red-50/30 p-6">
                <div className="mb-5 flex items-center gap-3">
                  <AlertTriangle className="text-red-700" size={24} />
                  <h3 className="text-lg font-semibold text-red-950">Danger Zone</h3>
                </div>
                <p className="mb-5 text-sm text-red-800">
                  Deactivating your account will prevent you from logging in and accessing any of your reservations. 
                  This action is immediate. If you need to recover your account later, you will need to contact an administrator.
                </p>
                <button onClick={handleDeactivate} className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50">
                  <LogOut size={16} />
                  Deactivate My Account
                </button>
              </section>
            )}
          </div>
        </div>

        <Toast open={Boolean(toastMessage)} message={toastMessage} onClose={() => setToastMessage("")} />
      </div>
    </AppShell>
  );
}
