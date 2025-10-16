'use client';

import { useEffect, useState } from 'react';
import { useSignUpWithEmail } from '@/features/auth/hooks/useSignUpWithEmail';
import { useSignInWithEmail } from '@/features/auth/hooks/useSignInWithEmail';
import { useModalStore } from '@/store/useModalStore';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Button } from '@heroui/react';

interface AuthModalProps {
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ initialMode = 'signup' }: AuthModalProps) {
  const { isModalOpen, closeModal, authMode } = useModalStore();
  const isOpen = isModalOpen('auth-modal');
  const onClose = () => closeModal('auth-modal');

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const signUp = useSignUpWithEmail();
  const signIn = useSignInWithEmail();

  useEffect(() => {
    if (isOpen) {
      setMode(authMode ?? initialMode);
    }
  }, [isOpen, authMode, initialMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        signUp.reset();
        signIn.reset();
        return setFormError('Passwords do not match');
      }
      signUp.mutate({ email, password });
    } else {
      signIn.mutate({ email, password });
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFormError(null);
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetForm();
    // Reset errors when switching modes
    signUp.reset();
    signIn.reset();
  };

  // Clear form error when mutations succeed
  useEffect(() => {
    if (signUp.isSuccess || signIn.isSuccess) {
      setFormError(null);
    }
  }, [signUp.isSuccess, signIn.isSuccess]);

  const isPending = signUp.isPending || signIn.isPending;
  const error = signUp.error || signIn.error;
  const displayError = formError || error;

  return (
    <Modal
      hideCloseButton
      isDismissable
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      placement="center"
      classNames={{
        wrapper: 'items-center justify-center z-[9999]',
        backdrop: 'z-[9998]',
        base: 'bg-neutral rounded-3xl text-neutral-9 mx-4 my-4 z-[9999] w-full max-w-md',
        header: 'border-b-0',
        body: 'py-4',
        footer: 'border-t-0',
      }}
    >
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader className="flex flex-col gap-1 text-center text-neutral-9 pt-6 pb-0 px-4">
          <h2 className="heading-32 text-neutral-10">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="body-16-regular text-neutral-6">
            {mode === 'signup' ? 'Sign up to save your conversations' : 'Sign in to continue chatting'}
          </p>
        </ModalHeader>
        <ModalBody className="px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-4 mb-8">
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
                  className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl bg-neutral-1 border border-neutral-3 text-neutral-10 body-16-regular focus:outline-none focus:ring-2 focus:ring-secondary-2 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block body-16-semi text-neutral-10 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl bg-neutral-1 border border-neutral-3 text-neutral-10 body-16-regular focus:outline-none focus:ring-2 focus:ring-secondary-2 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {displayError && (
                <div className="p-3 rounded-xl bg-error-4 border border-error-3 mt-2">
                  <p className="caption-14-regular text-error-1">
                    {formError || (error?.message || 'Something went wrong. Please try again.')}
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              isDisabled={isPending}
              className="w-full py-6 body-16-semi rounded-full bg-secondary-2 text-white hover:bg-secondary-1 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isPending
                ? mode === 'signup'
                  ? 'Creating account...'
                  : 'Signing in...'
                : mode === 'signup'
                  ? 'Create Account'
                  : 'Sign In'}
            </Button>
          </form>
        </ModalBody>
        <ModalFooter className="flex flex-col gap-3 pb-8 px-6">
          <p className="body-16-regular text-neutral-6 text-center">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
              className="ml-2 caption-14-semi md:!body-16-semi text-secondary-2 hover:text-secondary-1 transition-colors"
            >
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}