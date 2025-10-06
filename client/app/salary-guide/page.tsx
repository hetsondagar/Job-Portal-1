'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SalaryGuideRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to salary calculator
    router.replace('/salary-calculator');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you to the salary calculator</p>
      </div>
    </div>
  );
}

