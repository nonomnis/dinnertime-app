'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function RootPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      router.push('/home');
    }
  }, [status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <LoadingSpinner size="lg" label="Loading DinnerTime..." />
    </div>
  );
}
