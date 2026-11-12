'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const DonationForm = () => {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'day' | 'month'>('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amounts = [0.50, 10, 25, 50, 100];

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    // Auto-set to daily if $0.50 is selected
    if (amount === 0.50) {
      setIsRecurring(true);
      setRecurringInterval('day');
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setCustomAmount(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalAmount = selectedAmount !== null ? selectedAmount : (parseFloat(customAmount) || 0);

    if (finalAmount <= 0) {
      setError('Please enter a valid donation amount.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          recurring: isRecurring,
          interval: isRecurring ? recurringInterval : 'one-time',
          metadata: {
            source: 'donation_form',
            campaign: 'general_relief'
          }
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else if (data.sessionId) {
        const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId });
        } else {
          throw new Error('Stripe has not loaded yet. Please try again in a moment.');
        }
      } else {
        throw new Error('No checkout URL received from server.');
      }
    } catch (err: any) {
      console.error("Donation Form Error:", err);
      setError(typeof err.message === 'string' ? err.message : "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900">🌟 Make a Difference</h2>
            <p className="text-lg text-gray-600">Your generous support brings hope and love to families in Haiti.</p>
        </div>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {amounts.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant={selectedAmount === amount ? 'default' : 'outline'}
            onClick={() => handleAmountClick(amount)}
            className={`h-16 px-2 text-lg font-bold rounded-2xl transition-all ${
              selectedAmount === amount 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg scale-105' 
                : 'hover:border-red-500 hover:text-red-600'
            }`}
          >
            {amount < 1 ? `${amount * 100}¢` : `$${amount}`}
          </Button>
        ))}
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-500 text-lg">$</span>
        </div>
        <Input
          id="custom-amount"
          type="number"
          placeholder="Enter custom amount"
          value={customAmount}
          onChange={handleCustomAmountChange}
          step="0.01"
          min="0.50"
          className="h-16 pl-10 text-center text-xl font-semibold rounded-2xl border-2 focus:border-red-500 transition-all"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:bg-gray-100">
          <div className="space-y-1">
            <Label htmlFor="recurring-donation" className="text-lg font-bold text-gray-900 cursor-pointer">Recurring Giving</Label>
            <p className="text-sm text-gray-500">Provide steady, reliable support.</p>
          </div>
          <Switch
            id="recurring-donation"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
            className="data-[state=checked]:bg-red-600"
          />
        </div>

        {isRecurring && (
          <div className="flex gap-4 p-2 bg-gray-50 rounded-xl justify-center">
            <Button
              type="button"
              variant={recurringInterval === 'day' ? 'default' : 'ghost'}
              onClick={() => setRecurringInterval('day')}
              className={recurringInterval === 'day' ? 'bg-red-600' : ''}
            >
              Daily
            </Button>
            <Button
              type="button"
              variant={recurringInterval === 'month' ? 'default' : 'ghost'}
              onClick={() => setRecurringInterval('month')}
              className={recurringInterval === 'month' ? 'bg-red-600' : ''}
            >
              Monthly
            </Button>
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full h-16 text-xl font-extrabold rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100" 
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Donate {isRecurring ? `${recurringInterval === 'day' ? 'Daily' : 'Monthly'}` : ''} Now
          </span>
        )}
      </Button>
      <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Secure payment processing by Stripe
      </p>
    </form>
  );
};

export default DonationForm;
