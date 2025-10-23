'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@heroui/react';
import { AlertTriangle } from '../icons';
import { signOut } from '@/lib/auth';

export default function AuthStatus() {
  const { user } = useAuth();

  const handleSafeExit = async () => {
    try {
      // If authenticated user, sign out first
      if (user) {
        await signOut();
      }

      // Clear all local storage, session storage, and cookies for privacy
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach(c => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(
            /=.*/,
            '=;expires=' + new Date().toUTCString() + ';path=/'
          );
      });

      // Redirect to Google for both authenticated and anonymous users
      window.location.replace('https://www.google.com');
      window.close();
    } catch (error) {
      console.error('Failed safe exit:', error);
      // Still clear storage and redirect even if signout fails
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach(c => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(
            /=.*/,
            '=;expires=' + new Date().toUTCString() + ';path=/'
          );
      });
      window.location.replace('https://www.google.com');
      window.close();
    }
  };

  return (
    <>
      {/* Desktop version - expandable button */}
      <Button
        size="sm"
        color="danger"
        onPress={handleSafeExit}
        variant="shadow"
        aria-label="Emergency delete"
        className="hidden xl:group xl:relative xl:flex xl:items-center xl:justify-start xl:min-w-0 xl:h-12 xl:w-12 xl:hover:w-[200px] xl:!p-0 caption-14-semi xl:!text-[16px] rounded-full z-10 transition-all duration-500 ease-in-out overflow-hidden"
      >
        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center pointer-events-none z-20">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <span className="absolute left-11 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out whitespace-nowrap pr-4 z-10">
          Emergency delete
        </span>
      </Button>

      {/* Mobile/tablet version */}
      <Button
        size="sm"
        color="danger"
        variant="shadow"
        onPress={handleSafeExit}
        className="xl:hidden py-5 md:py-6 px-3 caption-14-semi md:!text-[16px] rounded-full z-10"
      >
        <AlertTriangle size={14} className="md:w-4 md:h-4" />
        <span className="hidden sm:inline">Emergency delete</span>
        <span className="sm:hidden">Delete</span>
      </Button>
    </>
  );
}