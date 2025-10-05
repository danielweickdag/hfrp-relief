"use client";

interface DonateButtonProps {
  amount: number;
  campaignId: string;
  userId?: string;
  planId?: string;
}

// Note: Stripe.js is loaded globally via script tag in layout.tsx
export default function DonateButton({ amount, campaignId, userId, planId }: DonateButtonProps) {
  const handleClick = async () => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, campaignId, userId, planId }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  return <button onClick={handleClick}>Donate with Stripe</button>;
}