'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@heroui/react';
import { AlertTriangle } from 'lucide-react';

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
      <Button
        size="sm"
        color="danger"
        variant="flat"
        onPress={handleUrgentDelete}
        className="py-5 md:py-6 xl:py-6 px-3 md:px-4 xl:px-5 body-16-semi md:!text-[18px] xl:!text-[18px] rounded-full"
      >
        <AlertTriangle size={14} className="md:w-4 md:h-4 xl:w-5 xl:h-5" />
        <span className="hidden sm:inline">Emergency delete</span>
        <span className="sm:hidden">Delete</span>
      </Button>
    );
  }
}