// src/app/dashboard/settings/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type Tab = "account" | "password";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [tab, setTab] = useState<Tab>("account");

  // Account form
  const [name, setName] = useState(session?.user?.name ?? "");
  const [email] = useState(session?.user?.email ?? "");
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleAccountSave(e: React.FormEvent) {
    e.preventDefault();
    setAccountLoading(true);
    setAccountMsg(null);
    try {
      const res = await fetch("/api/settings/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      await update({ name });
      setAccountMsg({ type: "success", text: "Account updated successfully." });
    } catch (err: unknown) {
      setAccountMsg({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setAccountLoading(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      setPasswordMsg({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordMsg({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setPasswordLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    outline: "none",
    fontFamily: "var(--font-body)",
    transition: "border-color 0.15s",
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "account", label: "Account" },
    { id: "password", label: "Password" },
  ];

  return (
    <div className="px-8 py-10 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="mb-10">
        <p
          className="text-xs tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
        >
          Settings
        </p>
        <h1
          className="font-display italic leading-none"
          style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 300, color: "var(--text)" }}
        >
          Your account.
        </h1>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit mb-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? "var(--surface-raised)" : "transparent",
              color: tab === t.id ? "var(--text)" : "var(--muted)",
              border: tab === t.id ? "1px solid var(--border)" : "1px solid transparent",
              boxShadow: tab === t.id ? "var(--shadow-sm)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Account tab ── */}
      {tab === "account" && (
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
        >
          <h2
            className="font-display italic mb-6"
            style={{ fontSize: 22, fontWeight: 300, color: "var(--text)" }}
          >
            Account details
          </h2>

          <form onSubmit={handleAccountSave} className="space-y-5">
            {/* Name */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Email — read only */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                disabled
                style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
                Email cannot be changed after signup.
              </p>
            </div>

            {/* Message */}
            {accountMsg && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: accountMsg.type === "success" ? "var(--green-subtle)" : "#fff1f0",
                  border: `1px solid ${accountMsg.type === "success" ? "var(--green)" : "#ffc9c9"}`,
                  color: accountMsg.type === "success" ? "var(--green)" : "#c0392b",
                }}
              >
                {accountMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={accountLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {accountLoading ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
      )}

      {/* ── Password tab ── */}
      {tab === "password" && (
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
        >
          <h2
            className="font-display italic mb-6"
            style={{ fontSize: 22, fontWeight: 300, color: "var(--text)" }}
          >
            Change password
          </h2>

          <form onSubmit={handlePasswordSave} className="space-y-5">
            {/* Current password */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                Current password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted)" }}
                >
                  {showCurrent ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                New password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted)" }}
                >
                  {showNew ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  ...inputStyle,
                  borderColor: confirmPassword && confirmPassword !== newPassword
                    ? "#fca5a5"
                    : confirmPassword && confirmPassword === newPassword
                    ? "var(--green)"
                    : "var(--border)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    confirmPassword && confirmPassword !== newPassword ? "#fca5a5"
                    : confirmPassword && confirmPassword === newPassword ? "var(--green)"
                    : "var(--border)";
                }}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Passwords do not match</p>
              )}
            </div>

            {/* Message */}
            {passwordMsg && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: passwordMsg.type === "success" ? "var(--green-subtle)" : "#fff1f0",
                  border: `1px solid ${passwordMsg.type === "success" ? "var(--green)" : "#ffc9c9"}`,
                  color: passwordMsg.type === "success" ? "var(--green)" : "#c0392b",
                }}
              >
                {passwordMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {passwordLoading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}