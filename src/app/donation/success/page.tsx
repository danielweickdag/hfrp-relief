
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type VerifiedDonation = {
  status: "paid";
  amount: number;
  currency: string;
  campaign: string;
  frequency: "once" | "monthly";
  date: string;
  reference: string;
};

function DonationSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [donation, setDonation] =
    useState<VerifiedDonation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function verifyDonation() {
      setLoading(true);
      setError("");
      setDonation(null);

      if (!sessionId) {
        setError("No Stripe Checkout Session was provided.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/donations/session?session_id=${encodeURIComponent(
            sessionId
          )}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to verify your donation with Stripe."
          );
        }

        const result: unknown = await response.json();

        if (
          !result ||
          typeof result !== "object" ||
          !("status" in result) ||
          result.status !== "paid"
        ) {
          setError(
            "Your payment has not yet been confirmed. Please check again shortly."
          );
          return;
        }

        const details = result as VerifiedDonation;

        if (
          typeof details.amount !== "number" ||
          !Number.isFinite(details.amount) ||
          typeof details.currency !== "string" ||
          typeof details.campaign !== "string" ||
          typeof details.reference !== "string" ||
          typeof details.date !== "string" ||
          !["once", "monthly"].includes(details.frequency)
        ) {
          throw new Error("Invalid payment verification response.");
        }

        if (!controller.signal.aborted) {
          setDonation(details);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to verify your donation."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void verifyDonation();

    return () => controller.abort();
  }, [sessionId]);

  const amountText = donation
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: donation.currency,
      }).format(donation.amount)
    : "";

  const dateText = donation?.date
    ? donation.date
    : "";

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {loading ? (
            <>
              <div className="mx-auto h-16 w-16 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Verifying Your Donation
              </h2>

              <p className="mt-3 text-gray-600">
                Please wait while we confirm your payment
                securely with Stripe.
              </p>
            </>
          ) : donation ? (
            <>
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Thank You!
              </h2>

              <p className="mt-2 text-lg text-gray-600">
                Your donation has been confirmed successfully.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                You&apos;re making a real difference in Haiti! 🇭🇹
              </p>

              <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Donation Details
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Amount:
                    </span>

                    <span className="font-medium text-green-600 text-right">
                      {amountText}
                      {donation.frequency === "monthly"
                        ? " / month"
                        : ""}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Campaign:
                    </span>

                    <span className="font-medium text-right break-words">
                      {donation.campaign}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Donation Type:
                    </span>

                    <span className="font-medium">
                      {donation.frequency === "monthly"
                        ? "Monthly Subscription"
                        : "One-Time Donation"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Date:
                    </span>

                    <span className="font-medium">
                      {dateText}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Reference:
                    </span>

                    <span className="font-mono text-xs">
                      {donation.reference}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Payment Status:
                    </span>

                    <span className="font-semibold text-green-600">
                      Confirmed
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700">
                    Your payment has been verified with Stripe.
                    Please check your email for any receipt
                    issued by Stripe.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  <path
                    d="M12 7v6m0 3h.01"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Payment Verification Pending
              </h2>

              <p role="alert" className="mt-3 text-gray-600">
                {error ||
                  "We could not confirm your payment at this time."}
              </p>

              <p className="mt-3 text-sm text-gray-500">
                If you have already submitted payment, please
                check your Stripe receipt or contact our team
                before trying again.
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Check Again
              </button>
            </>
          )}

          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Return Home
              </a>

              <a
                href="/donate"
                className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md text-blue-700 bg-white hover:bg-blue-50 text-sm font-medium transition-colors"
              >
                Donate Again
              </a>
            </div>

            <div className="text-center">
              <a
                href="/about"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Learn more about our mission →
              </a>
            </div>
          </div>

          {donation && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Help us spread the word!
              </p>

              <div className="flex justify-center space-x-6">
                <button
                  type="button"
                  aria-label="Share on X"
                  onClick={() => {
                    const message =
                      "I'm supporting Haitian Family Relief Project! Join me in helping families in Haiti. 🇭🇹";

                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        message
                      )}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  className="text-blue-400 hover:text-blue-500 font-medium"
                >
                  Share on X
                </button>

                <button
                  type="button"
                  aria-label="Share on Facebook"
                  onClick={() => {
                    const url =
                      "https://familyreliefproject7.org";

                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        url
                      )}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Facebook
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DonationSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-green-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      }
    >
      <DonationSuccessContent />
    </Suspense>
  );
}
