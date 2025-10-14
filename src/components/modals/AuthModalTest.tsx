'use client';

import { useEffect, useState } from 'react';
import { useSignUpWithEmail } from '@/features/auth/hooks/useSignUpWithEmail';
import { useSignInWithEmail } from '@/features/auth/hooks/useSignInWithEmail';

interface AuthModalTestProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModalTest({ isOpen, onClose, initialMode = 'signup' }: AuthModalTestProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signUp = useSignUpWithEmail();
  const signIn = useSignInWithEmail();

  // Sync mode with prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup') {
      signUp.mutate({ email, password });
    } else {
      signIn.mutate({ email, password });
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetForm();
  };

  const isPending = signUp.isPending || signIn.isPending;
  const error = signUp.error || signIn.error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-neutral rounded-3xl p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-2 transition-colors"
        >
          <svg
            className="w-6 h-6 text-neutral-9"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="heading-32 text-neutral-10 mb-2">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="body-16-regular text-neutral-6">
            {mode === 'signup'
              ? 'Sign up to save your conversations'
              : 'Sign in to continue chatting'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block body-16-semi text-neutral-10 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-neutral-1 border border-neutral-3 text-neutral-10 body-16-regular focus:outline-none focus:ring-2 focus:ring-secondary-2 transition-all"
              placeholder="your@email.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block body-16-semi text-neutral-10 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-neutral-1 border border-neutral-3 text-neutral-10 body-16-regular focus:outline-none focus:ring-2 focus:ring-secondary-2 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password removed for testing */}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-error-4 border border-error-3">
              <p className="caption-14-regular text-error-1">
                {error.message || 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-secondary-2 text-white body-16-semi hover:bg-secondary-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending
              ? mode === 'signup'
                ? 'Creating account...'
                : 'Signing in...'
              : mode === 'signup'
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="body-16-regular text-neutral-6">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
              className="ml-2 body-16-semi text-secondary-2 hover:text-secondary-1 transition-colors"
            >
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

