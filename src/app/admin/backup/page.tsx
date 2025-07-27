'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackupManagement from '@/app/_components/BackupManagement';
import AdminAuth from '@/app/_components/AdminAuth';

export default function BackupPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('admin-user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser({
        id: parsedUser.id,
        name: parsedUser.name,
        email: parsedUser.email
      });
    }
  }, []);

  if (!currentUser) {
    return <AdminAuth />;
  }

  return <BackupManagement currentUser={currentUser} />;
}
