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
  const [loading, setLoading] = useState(false);

  const amounts = [10, 25, 50, 100];

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setCustomAmount(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalAmount = selectedAmount || parseFloat(customAmount) || 0;

    if (finalAmount <= 0) {
      alert('Please enter a valid donation amount.');
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
          interval: isRecurring ? 'month' : 'one-time',
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (sessionId) {
        router.push(`/api/stripe/redirect?sessionId=${sessionId}`);
      } else {
        throw new Error('Could not create Stripe Checkout session.');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
            <h2 className="text-2xl font-bold">Make a Donation</h2>
            <p className="text-gray-600">Your support makes a difference.</p>
        </div>
      <div className="grid grid-cols-2 gap-4">
        {amounts.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant={selectedAmount === amount ? 'default' : 'outline'}
            onClick={() => handleAmountClick(amount)}
            className="h-12 text-lg"
          >
            ${amount}
          </Button>
        ))}
      </div>
      <div>
        <Label htmlFor="custom-amount" className="sr-only">Custom Amount</Label>
        <Input
          id="custom-amount"
          type="number"
          placeholder="Or enter a custom amount"
          value={customAmount}
          onChange={handleCustomAmountChange}
          step="0.01"
          min="1"
          className="h-12 text-center text-lg"
        />
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
        <Label htmlFor="recurring-donation" className="font-semibold">Make it a monthly donation</Label>
        <Switch
          id="recurring-donation"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
      </div>
      <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
        {loading ? 'Processing...' : 'Donate Now'}
      </Button>
    </form>
  );
};

export default DonationForm;
