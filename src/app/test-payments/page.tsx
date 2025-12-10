"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  AddressElement,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function CheckoutForm({
  amount,
  currency,
}: { amount: number; currency: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/donation/success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
    }
    setLoading(false);
  };

  const formatMoney = (amt: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amt / 100);

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 16, maxWidth: 480 }}
    >
      <h2>Test Payment</h2>
      <div>Amount: {formatMoney(amount)}</div>
      <AddressElement options={{ mode: "billing" }} />
      <PaymentElement options={{ layout: "accordion" }} />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" disabled={!stripe || !elements || loading}>
        {loading ? "Processing…" : "Pay"}
      </button>
    </form>
  );
}

export default function TestPaymentsPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount] = useState<number>(2000); // cents
  const [currency] = useState<string>("usd");

  useEffect(() => {
    const createPI = async () => {
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountCents: amount, currency }),
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error("Failed to create PI:", data);
        }
      } catch (err) {
        console.error("PI create error:", err);
      }
    };
    createPI();
  }, [amount, currency]);

  const options = clientSecret ? { clientSecret } : undefined;

  return (
    <div style={{ padding: 24 }}>
      <h1>Payment Element Demo</h1>
      {!clientSecret ? (
        <div>Initializing payment…</div>
      ) : (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm amount={amount} currency={currency} />
        </Elements>
      )}
    </div>
  );
}
