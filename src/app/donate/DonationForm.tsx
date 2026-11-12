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
  const [selectedAmount, setSelectedAmount] = useState<number | null>(0.50);
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurringInterval, setRecurringInterval] = useState<'day' | 'month'>('day');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherAmounts = [50, 100, 200, 350, 500];

  const handleHeroClick = () => {
    setSelectedAmount(0.50);
    setCustomAmount('');
    setIsRecurring(true);
    setRecurringInterval('day');
  };

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setIsRecurring(false);
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
        <h2 className="text-3xl font-extrabold text-gray-900">🌟 Join the Movement</h2>
        <p className="text-lg text-gray-600">Consistent support makes the biggest impact for families in Haiti.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Hero Section: 50¢ Daily */}
      <div 
        onClick={handleHeroClick}
        className={`relative p-8 rounded-3xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] border-4 ${
          selectedAmount === 0.50 && isRecurring && recurringInterval === 'day'
            ? 'bg-red-50 border-red-600 shadow-xl'
            : 'bg-gray-50 border-transparent hover:border-red-200 shadow-sm'
        }`}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-1 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg">
          Most Impactful
        </div>
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-6xl font-black text-red-600">50¢</span>
            <span className="text-xl font-bold text-gray-500">/ Day</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-gray-900">Become a Hope Sustainer</h3>
            <p className="text-gray-600 max-w-sm mx-auto">Just 50 cents a day provides consistent meals and education to children in need.</p>
          </div>
          <div className={`px-8 py-3 rounded-2xl font-black text-xl transition-colors ${
            selectedAmount === 0.50 && isRecurring && recurringInterval === 'day'
              ? 'bg-red-600 text-white'
              : 'bg-white text-red-600 border-2 border-red-600'
          }`}>
            Sustain Now
          </div>
        </div>
      </div>

      <div className="relative py-4 flex items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 font-medium uppercase text-xs tracking-widest">Or choose another way to help</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Secondary Section: One-time Amounts */}
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {otherAmounts.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant={selectedAmount === amount ? 'default' : 'outline'}
              onClick={() => handleAmountClick(amount)}
              className={`h-14 px-2 text-lg font-bold rounded-2xl transition-all ${
                selectedAmount === amount 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' 
                  : 'bg-white hover:border-red-500 hover:text-red-600 text-gray-700'
              }`}
            >
              ${amount}
            </Button>
          ))}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">$</span>
            </div>
            <Input
              id="custom-amount"
              type="number"
              placeholder="Other"
              value={customAmount}
              onChange={handleCustomAmountChange}
              step="0.01"
              min="0.50"
              className="h-14 pl-7 text-center text-lg font-semibold rounded-2xl border-2 focus:border-red-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Options for Custom/Other Amounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:bg-gray-100">
            <div className="space-y-0.5">
              <Label htmlFor="recurring-donation" className="text-base font-bold text-gray-900 cursor-pointer">Recurring Giving</Label>
              <p className="text-xs text-gray-500">Provide steady support automatically.</p>
            </div>
            <Switch
              id="recurring-donation"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
              className="data-[state=checked]:bg-red-600"
            />
          </div>

          {isRecurring && selectedAmount !== 0.50 && (
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl justify-center">
              <Button
                type="button"
                size="sm"
                variant={recurringInterval === 'day' ? 'default' : 'ghost'}
                onClick={() => setRecurringInterval('day')}
                className={`flex-1 rounded-lg ${recurringInterval === 'day' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white/50'}`}
              >
                Daily
              </Button>
              <Button
                type="button"
                size="sm"
                variant={recurringInterval === 'month' ? 'default' : 'ghost'}
                onClick={() => setRecurringInterval('month')}
                className={`flex-1 rounded-lg ${recurringInterval === 'month' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white/50'}`}
              >
                Monthly
              </Button>
            </div>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-xl transform hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100" 
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
      
      <div className="flex flex-col items-center space-y-2">
        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure payment processing by Stripe
        </p>
      </div>
    </form>
  );
};

export default DonationForm;
