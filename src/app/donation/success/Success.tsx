'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function Success() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");
  const [donationDetails, setDonationDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonationDetails = async () => {
      if (sessionId) {
        try {
          const response = await fetch(`/api/stripe/checkout/${sessionId}`);
          const data = await response.json();
          if (response.ok) {
            setDonationDetails({
              amount: data.amount_total / 100,
              donorName: data.customer_details.name,
              transactionId: data.payment_intent,
              date: new Date().toLocaleDateString(),
            });
          } else {
            throw new Error("Failed to fetch donation details from API");
          }
        } catch (error) {
          console.error("Failed to fetch donation details:", error);
          setDonationDetails({
             amount: "N/A",
             donorName: "N/A",
             transactionId: sessionId, // show session id as fallback
             date: new Date().toLocaleDateString(),
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchDonationDetails();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading donation details...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Thank You!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your donation has been processed successfully.
        </p>
        <div className="mt-6 border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
             {donationDetails && (
               <>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                    ${donationDetails.amount.toFixed(2)}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right break-all">
                    {donationDetails.transactionId}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                    {donationDetails.date}
                  </dd>
                </div>
              </>
             )}
          </dl>
        </div>
        <div className="pt-6">
            <Link href="/" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Return Home
            </Link>
        </div>
      </div>
    </div>
  );
}
