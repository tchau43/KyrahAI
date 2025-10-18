'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import SettingsModal from '@/components/modals/SettingsModal';
import { getUserPreferences, updateUserPreferences, updateUserDisplayName } from '@/lib/auth';
import { createClient } from '@/utils/supabase/client';
import type { UserPreferences } from '@/types/auth.types';
import { LogOut, Settings, UserCircle } from '@/components/icons';
import { useSignOut } from '@/features/auth/hooks/useSignOut';

interface UserData {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  preferences: UserPreferences | null;
}

interface ChatSidebarFooterProps {
  isCollapsed?: boolean;
}

export default function ChatSidebarFooter({ isCollapsed = false }: ChatSidebarFooterProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { mutate: signOut } = useSignOut();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !authUser) {
        setUser(null);
        return;
      }

      const preferences = await getUserPreferences();

      setUser({
        id: authUser.id,
        email: authUser.email || 'user@example.com',
        name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User',
        avatar: authUser.user_metadata?.avatar_url || null,
        preferences: preferences,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDisplayName = async (displayName: string) => {
    try {
      if (!user) {
        throw new Error('No user found');
      }

      await updateUserDisplayName(displayName);

      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          name: displayName,
        };
      });
    } catch (error) {
      console.error('Failed to update display name:', error);
      alert('Failed to update display name. Please try again.');
      throw error;
    }
  };

  const handleSaveSettings = async (preferencesUpdate: Partial<UserPreferences>) => {
    try {
      if (!user) {
        throw new Error('No user found');
      }

      const updatedPreferences = await updateUserPreferences(preferencesUpdate);

      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          preferences: updatedPreferences,
        };
      });

      return updatedPreferences;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  };

  const handleDownloadData = async () => {
    try {
      if (!user) {
        throw new Error('No user found');
      }

      const data = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        preferences: user.preferences,
        conversations: [],
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kyrah-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download data:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  if (isLoading) {
    return (
      <div className={`px-4 py-2 border-t border-neutral-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 p-2 ${isCollapsed ? 'flex-col' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-neutral-2 animate-pulse" />
          {!isCollapsed && (
            <div className="flex-1">
              <div className="h-4 bg-neutral-2 rounded w-24 mb-1 animate-pulse" />
              <div className="h-3 bg-neutral-2 rounded w-32 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className={`border-t border-neutral-2 ${isCollapsed ? 'px-2 py-2' : 'px-2 py-2'}`}>
        <Dropdown placement="top-start">
          <DropdownTrigger>
            <button className={`w-full flex cursor-pointer hover:bg-neutral-1 rounded-lg p-2 transition-colors ${isCollapsed ? 'flex justify-center' : ''
              }`}>
              <User
                name={user.name}
                description={user.email}
                avatarProps={{
                  size: 'sm',
                  name: user.name,
                  className: 'bg-primary text-white flex-shrink-0',
                  icon: <UserCircle size={20} />,
                }}
                classNames={{
                  base: 'gap-3',
                  wrapper: isCollapsed ? 'hidden' : 'min-w-0',
                  name: 'caption-14-semi text-neutral-9 truncate',
                  description: 'caption-12-regular text-neutral-6 truncate',
                }}
              />
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu actions" className='w-60'
          >
            <DropdownItem
              key="settings"
              startContent={<Settings size={20} />}
              onPress={() => setIsSettingsOpen(true)}
              className='text-neutral-9 body-18-semi'
            >
              Settings
            </DropdownItem>
            <DropdownItem
              key="logout"
              startContent={<LogOut size={20} />}
              color="danger"
              className="text-danger body-18-semi"
              onPress={handleSignOut}
            >
              Sign out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {user.preferences && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={{
            ...user,
            preferences: user.preferences,
          }}
          onSave={handleSaveSettings}
          onSaveDisplayName={handleSaveDisplayName}
          onDownloadData={handleDownloadData}
        />
      )}
    </>
  );
}