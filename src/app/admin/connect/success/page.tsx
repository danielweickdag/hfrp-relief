'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConnectSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sid = searchParams?.get('session_id') ?? null;
    const aid = searchParams?.get('accountId') ?? null;
    setSessionId(sid);
    setAccountId(aid);
  }, [searchParams]);

  const handleManageBilling = async () => {
    setError(null);
    if (!sessionId || !accountId) {
      setError('Missing session_id or accountId in URL');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/stripe/connect/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, accountId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create portal session');
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = async () => {
    setError(null);
    if (!accountId) {
      setError('Missing accountId in URL');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/stripe/connect/login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create login link');
      }
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Successful</CardTitle>
          <CardDescription>Your payment was successful. You can manage billing or open your account dashboard below.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded-md text-red-800">{error}</div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Session ID: {sessionId || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">Account ID: {accountId || 'N/A'}</p>
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Button onClick={handleManageBilling} disabled={loading || !sessionId || !accountId}>
              {loading ? 'Please wait…' : 'Manage billing information'}
            </Button>
            <Button variant="outline" onClick={handleGoToDashboard} disabled={loading || !accountId}>
              Go to Connected Account dashboard
            </Button>
            <Button variant="secondary" onClick={() => router.push('/admin/connect')}>Back to products</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}