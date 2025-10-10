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

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Donate with Stripe"
      className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-4 text-white font-semibold text-lg shadow-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span>Donate with Stripe</span>
    </button>
  );
}