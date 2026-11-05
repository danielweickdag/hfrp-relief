"use client";

import { useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  category: "Meals" | "Health" | "Education" | "Housing" | "General" | "Daily Hope";
  amount: number;
  frequency: "once" | "monthly";
  disabled?: boolean;
};

export default function DonationCheckoutButton({ children, className = "", category, amount, frequency, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function checkout() {
    if (loading || disabled) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount, frequency }),
      });
      const payload: { url?: string; error?: string } = await response.json();
      if (!response.ok || !payload.url || !payload.url.startsWith("https://checkout.stripe.com/")) {
        throw new Error(payload.error || "Unable to open Stripe Checkout");
      }
      window.location.assign(payload.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to open checkout");
      setLoading(false);
    }
  }
  return (
    <div>
      <button type="button" onClick={checkout} disabled={disabled || loading}
        className={`${className} ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}`}>
        {loading ? "Opening secure checkout…" : children}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
