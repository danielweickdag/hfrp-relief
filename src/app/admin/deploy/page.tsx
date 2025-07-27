'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeploymentChecklist from '@/app/_components/DeploymentChecklist';
import AdminAuth from '@/app/_components/AdminAuth';

export default function DeployPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('admin-user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
    }
  }, []);

  if (!currentUser) {
    return <AdminAuth />;
  }

  // Only superadmins can access deployment checklist
  if (currentUser.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only superadmins can access the deployment checklist.
          </p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <DeploymentChecklist />;
}
