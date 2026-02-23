import React from "react";

export function SubscriptionPopup({
  open,
  trialExpired,
  trialRemainingDays,
  isDemoPlanSelected,
  onClose,
  onSubscribe
}) {
  if (!open) return null;

  const subtitle = trialExpired
    ? "Your 14-day demo period has expired. Purchase a plan to continue."
    : isDemoPlanSelected
      ? `Demo is active. ${trialRemainingDays} day(s) left.`
      : "Choose Demo Plan (14 days) or purchase a paid plan to continue.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--background)",
          borderColor: "var(--border-light)",
          color: "var(--text)"
        }}
      >
        <h2 className="text-2xl font-bold">Subscription Required</h2>
        <p className="mt-3 text-sm opacity-85">{subtitle}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onSubscribe}
            className="flex-1 rounded-lg px-4 py-2.5 font-semibold text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            View Plans
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2.5 font-semibold"
            style={{ borderColor: "var(--border-light)" }}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
