import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function DonateButton({ amount, campaignId, userId, planId }) {
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