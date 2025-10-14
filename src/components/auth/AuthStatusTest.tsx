'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthStatusTest() {
  const { user, loading, authType } = useAuth();

  if (loading) {
    return (
      <div className="px-4 py-2 bg-neutral-1 rounded-lg border border-neutral-3">
        <p className="caption-14-regular text-neutral-6">Loading...</p>
      </div>
    );
  }

  if (!user && authType === 'anonymous') {
    return (
      <div className="px-4 py-2 bg-warning-4 rounded-lg border border-warning-3">
        <p className="caption-14-semi text-warning-1">
          🎭 Anonymous Session
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="px-4 py-2 bg-success-4 rounded-lg border border-success-3">
        <p className="caption-14-semi text-success-1">
          ✅ Signed in as: {user.email}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 bg-neutral-1 rounded-lg border border-neutral-3">
      <p className="caption-14-regular text-neutral-6">
        Not signed in
      </p>
    </div>
  );
}

