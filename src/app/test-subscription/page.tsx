"use client";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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

function useDebounce<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function SubscriptionForm({ priceId }: { priceId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [estimate, setEstimate] = useState<{
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
  } | null>(null);
  type BillingAddress = {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null;
  const lastAddressRef = useRef<BillingAddress>(null);

  const debouncedAddress = useDebounce(lastAddressRef.current, 600);

  useEffect(() => {
    const doEstimate = async () => {
      if (!customerId || !debouncedAddress) return;
      try {
        // Update customer address and validate location immediately
        await fetch("/api/stripe/customer/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            address: debouncedAddress,
            validateLocation: "immediately",
          }),
        });

        const res = await fetch("/api/stripe/subscriptions/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, priceId }),
        });
        const data = await res.json();
        if (data?.estimate) setEstimate(data.estimate);
      } catch (e) {
        console.error("Estimate error", e);
      }
    };
    doEstimate();
  }, [customerId, debouncedAddress, priceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      // Validate Address/Payment Element fields before creating the subscription
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Validation failed");
        setLoading(false);
        return;
      }

      // Create subscription and get client secret for the latest invoice payment intent
      const subRes = await fetch("/api/stripe/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          priceId,
          automaticTaxEnabled: true,
          saveDefaultPaymentMethod: "on_subscription",
        }),
      });
      const subData = await subRes.json();
      const clientSecret: string | undefined =
        subData?.clientSecret || undefined;
      if (!clientSecret) {
        throw new Error("No client secret returned for subscription");
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/donation/success`,
        },
      });
      if (confirmError) {
        setError(confirmError.message || "Payment confirmation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscription failed");
    }
    setLoading(false);
  };

  const formatMoney = (amt: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format((amt || 0) / 100);

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 16, maxWidth: 520 }}
    >
      <h2>Subscription Demo</h2>
      <label>
        Customer ID
        <input
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="cus_..."
        />
      </label>

      <AddressElement
        options={{ mode: "billing" }}
        onChange={(ev) => {
          if (ev.complete && ev.value?.address) {
            const addr = ev.value.address;
            lastAddressRef.current = {
              ...addr,
              line2: addr.line2 ?? undefined,
            };
          }
        }}
      />

      <PaymentElement options={{ layout: "accordion" }} />

      {estimate && (
        <div>
          <div>
            Subtotal: {formatMoney(estimate.subtotal, estimate.currency)}
          </div>
          <div>Tax: {formatMoney(estimate.tax, estimate.currency)}</div>
          <div>Total: {formatMoney(estimate.total, estimate.currency)}</div>
        </div>
      )}

      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" disabled={!stripe || !elements || loading}>
        {loading ? "Processing…" : "Start Subscription"}
      </button>
    </form>
  );
}

export default function TestSubscriptionPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const priceId = process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID || "";

  // Use a tiny PaymentIntent to initialize Elements and allow PaymentElement rendering
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountCents: 50, currency: "usd" }),
        });
        const data = await res.json();
        if (data.clientSecret) setClientSecret(data.clientSecret);
      } catch (e) {
        console.error("Init PI error", e);
      }
    };
    init();
  }, []);

  const options = useMemo(
    () => (clientSecret ? { clientSecret } : undefined),
    [clientSecret],
  );

  return (
    <div style={{ padding: 24 }}>
      <h1>Subscription with Automatic Tax</h1>
      {!priceId && (
        <div style={{ color: "orange" }}>
          Set NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID in env.
        </div>
      )}
      {!clientSecret ? (
        <div>Loading payment UI…</div>
      ) : (
        <Elements stripe={stripePromise} options={options}>
          <SubscriptionForm priceId={priceId} />
        </Elements>
      )}
    </div>
  );
}
