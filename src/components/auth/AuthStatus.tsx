'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@heroui/react';
import { AlertTriangle } from '../icons';

export default function AuthStatus() {
  const { user } = useAuth();

  const handleUrgentDelete = async () => {
    try {
      if (!user) {
        throw new Error('No user found');
      }

      console.log('Urgent delete triggered for user:', user.id);

      // TODO: Implement API call to delete account
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Safe exit
      window.location.href = 'https://www.google.com';
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Error deleting account. Please try again or contact support.');
    }
  };

  if (user) {
    return (
      <>
        <Button
          size="sm"
          color="danger"
          variant="shadow"
          onPress={handleUrgentDelete}
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

        <Button
          size="sm"
          color="danger"
          variant="shadow"
          onPress={handleUrgentDelete}
          className="xl:hidden py-5 md:py-6 px-3 md:px-4 caption-14-semi md:!text-[16px] rounded-full z-10"
        >
          <AlertTriangle size={14} className="md:w-4 md:h-4" />
          <span className="hidden sm:inline">Emergency delete</span>
          <span className="sm:hidden">Delete</span>
        </Button>
      </>
    );
  }
}