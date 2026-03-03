'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-2xl text-white mx-auto mb-4 animate-pulse">
          DF
        </div>
        <p className="text-purple-200 text-sm">Loading...</p>
      </div>
    </div>
  );
}
