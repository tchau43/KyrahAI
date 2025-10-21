'use client';

import { UserPreferences } from '@/types/auth.types';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Divider,
  Select,
  SelectItem,
  Switch,
} from '@heroui/react';
import { useState, useEffect } from 'react';
import { Clock, Download, Globe, HeartHandshake, MessageSquare, Shield } from '../icons';
import { getTimezoneOffset } from '@/lib/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    preferences: UserPreferences;
  };
  onSave: (preferences: Partial<UserPreferences>) => Promise<UserPreferences>;
  onSaveDisplayName: (displayName: string) => Promise<void>;
  onDownloadData: () => void;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'pt', label: 'Português (Portuguese)' },
  { value: 'bn', label: 'বাংলা (Bengali)' },
  { value: 'ru', label: 'Русский (Russian)' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'jv', label: 'Basa Jawa (Javanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'mr', label: 'मराठी (Marathi)' },
  { value: 'tr', label: 'Türkçe (Turkish)' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'it', label: 'Italiano (Italian)' },
  { value: 'th', label: 'ไทย (Thai)' },
  { value: 'pl', label: 'Polski (Polish)' },
  { value: 'nl', label: 'Nederlands (Dutch)' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'uk', label: 'Українська (Ukrainian)' },
];

const getTimezones = () => {
  const timezones = Intl.supportedValuesOf('timeZone');
  const now = new Date();

  return [
    { value: 'auto', label: 'Auto detect' },
    ...timezones.map((tz) => {
      try {
        const offset = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          timeZoneName: 'shortOffset',
        })
          .formatToParts(now)
          .find((part) => part.type === 'timeZoneName')?.value || '';

        const name = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
        const region = tz.split('/')[0];

        return {
          value: tz,
          label: `${name} (${offset}) - ${region}`,
        };
      } catch {
        return { value: tz, label: tz };
      }
    }),
  ];
};

const TIMEZONES = getTimezones();

const RETENTION_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 7, label: '7 days' },
  { value: 15, label: '15 days' },
  { value: 30, label: '30 days' },
];

export default function SettingsModal({
  isOpen,
  onClose,
  user,
  onSave,
  onSaveDisplayName,
}: SettingsModalProps) {
  const [preferences, setPreferences] = useState(user.preferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [detectedTimezone, setDetectedTimezone] = useState<string>('');
  const [userName, setUserName] = useState(user.name || '');

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDetectedTimezone(tz);

    if (preferences.timezone === 'auto') {
      const timezoneOffset = getTimezoneOffset(tz);
      setPreferences(prev => ({
        ...prev,
        timezone: tz,
        timezone_offset: timezoneOffset
      }));
    }
  }, [preferences.timezone]);

  const handleUserNameChange = (value: string) => {
    setUserName(value);
    setHasChanges(true);
  };

  const handlePreferenceChange = (
    key: keyof UserPreferences,
    value: string | number | boolean | { weekly_check_in: boolean; resource_updates: boolean }
  ) => {
    let finalValue = value;
    let timezoneOffset = null;

    if (key === 'timezone') {
      if (value === 'auto') {
        finalValue = detectedTimezone || value;
      }
      // Calculate timezone_offset when timezone changes
      timezoneOffset = getTimezoneOffset(finalValue as string);
    }

    setPreferences((prev) => {
      const updated = {
        ...prev,
        [key]: finalValue,
      };

      // Also update timezone_offset if timezone changed
      if (timezoneOffset !== null) {
        updated.timezone_offset = timezoneOffset;
      }

      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (userName !== user.name) {
        await onSaveDisplayName(userName);
      }

      const changes: Partial<UserPreferences> = {};
      (Object.keys(preferences) as Array<keyof UserPreferences>).forEach((key) => {
        if (JSON.stringify(preferences[key]) !== JSON.stringify(user.preferences[key])) {
          // TypeScript correctly ensures preferences[key] matches UserPreferences[key]
          (changes as any)[key] = preferences[key];
        }
      });

      if (Object.keys(changes).length > 0) {
        const updatedPreferences = await onSave(changes);
        setPreferences(updatedPreferences);
      }

      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPreferences(user.preferences);
    setUserName(user.name);
    setHasChanges(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          wrapper: 'items-center justify-center z-[9999]',
          backdrop: 'bg-black/50 z-[9998]',
          base: 'bg-neutral rounded-2xl xl:!rounded-3xl text-neutral-9 mx-4 xl:!mx-0 my-4 xl:!my-0',
          header: 'border-b-0',
          body: 'py-4 xl:!py-6',
          footer: 'border-t-0',
        }}
      >
        <ModalContent>
          {(onModalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-neutral-9 pt-6 xl:!pt-10 pb-2.5 px-4 xl:!px-8">
                <h2 className="heading-28 md:!text-[32px]">Settings</h2>
                <p className="body-16-regular xl:!text-[18px] text-neutral-6">
                  Manage your privacy and experience preferences
                </p>
              </ModalHeader>
              <ModalBody className="px-4 xl:!px-10 gap-4 xl:!gap-6">
                {/* User Name Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="text-primary" size={20} />
                    <h3 className="body-18-semi text-neutral-9">What should Kyrah call you?</h3>
                  </div>

                  <Card className="bg-neutral-1 shadow-xl px-2 py-2">
                    <CardBody className="space-y-3">
                      <div>
                        <label className="body-16-semi text-neutral-9 block mb-2">
                          Type in the name you feel most comfortable with:
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => handleUserNameChange(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full px-4 py-2.5 bg-neutral border border-neutral-4 rounded-lg body-16-regular text-neutral-9 placeholder:text-neutral-5 focus:outline-none focus:border-primary transition-colors"
                          maxLength={50}
                        />
                        <p className="caption-14-regular text-neutral-6 mt-1">
                          Kyrah will use this name when chatting with you
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Privacy & Data Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="text-primary" size={20} />
                    <h3 className="body-18-semi text-neutral-9">Privacy & Data</h3>
                  </div>

                  {/* Retention Period */}
                  <Card className="bg-neutral-1 shadow-xl px-2 py-2">
                    <CardBody className="space-y-3">
                      <div>
                        <label className="body-16-semi text-neutral-9 block mb-2">
                          Conversation retention period
                        </label>
                        <Select
                          selectedKeys={new Set([preferences.retention_days.toString()])}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            handlePreferenceChange('retention_days', parseInt(value));
                          }}
                          disallowEmptySelection
                          size="sm"
                          aria-label="Retention period"
                          classNames={{
                            trigger: 'bg-neutral border-neutral-4',
                            value: 'body-16-regular text-neutral-9',
                            selectorIcon: 'text-neutral-9',
                          }}
                        >
                          {RETENTION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} className="body-16-regular text-neutral-9">
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>
                        <p className="caption-14-regular text-neutral-6 mt-1">
                          Old conversations will be automatically deleted after this time
                        </p>
                      </div>

                      <Divider className="bg-neutral-3" />

                      {/* Download Data - DISABLED */}
                      <div className="flex items-center justify-between gap-4 opacity-50">
                        <div className="flex-1">
                          <p className="body-16-semi text-neutral-9">Download your data</p>
                          <p className="caption-14-regular text-neutral-6 mt-1">
                            Export all conversations as JSON file (Coming soon)
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<Download size={16} />}
                          isDisabled
                          className="bg-neutral-9 text-neutral py-5 caption-14-semi xl:!text-[16px] rounded-full"
                        >
                          Download
                        </Button>
                      </div>

                      <Divider className="bg-neutral-3" />

                      {/* Analytics - DISABLED */}
                      <div className="space-y-2 opacity-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="body-16-semi text-neutral-9">Anonymous analytics</p>
                            <p className="caption-14-regular text-neutral-6 mt-1">
                              Help improve Kyrah through usage data (Coming soon)
                            </p>
                          </div>
                          <Switch
                            isSelected={preferences.allow_analytics}
                            isDisabled
                            size="sm"
                            classNames={{
                              wrapper: "group-data-[selected=true]:bg-primary",
                            }}
                          />
                        </div>
                      </div>

                      <Divider className="bg-neutral-3" />

                      {/* Research Contribution - DISABLED */}
                      <div className="space-y-2 opacity-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="body-16-semi text-neutral-9">Research contribution</p>
                            <p className="caption-14-regular text-neutral-6 mt-1">
                              Allow use of anonymized data to prevent abuse (Coming soon)
                            </p>
                          </div>
                          <Switch
                            isSelected={preferences.allow_improvement_research}
                            isDisabled
                            size="sm"
                            classNames={{
                              wrapper: "group-data-[selected=true]:bg-primary",
                            }}
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Conversations Section */}
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="text-primary" size={20} />
                    <h3 className="body-18-semi text-neutral-9">Conversations</h3>
                  </div>

                  <Card className="bg-neutral-1 shadow-xl px-2 py-2">
                    <CardBody className="space-y-4">
                      {/* Language */}
                      <div>
                        <label className="body-16-semi text-neutral-9 flex items-center gap-2 mb-2">
                          <Globe size={16} />
                          Preferred language
                        </label>
                        <Select
                          selectedKeys={new Set([preferences.language])}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            handlePreferenceChange('language', value);
                          }}
                          disallowEmptySelection
                          size="sm"
                          aria-label="Preferred language"
                          classNames={{
                            trigger: 'bg-neutral border-neutral-4',
                            value: 'body-16-regular text-neutral-9',
                            selectorIcon: 'text-neutral-9',
                          }}
                        >
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} className="body-16-regular text-neutral-9">
                              {lang.label}
                            </SelectItem>
                          ))}
                        </Select>
                        <p className="caption-14-regular text-neutral-6 mt-1">
                          Language that AI will use to respond
                        </p>
                      </div>

                      <Divider className="bg-neutral-3" />

                      {/* Timezone */}
                      <div>
                        <label className="body-16-semi text-neutral-9 flex items-center gap-2 mb-2">
                          <Clock size={16} />
                          Timezone
                        </label>
                        <Select
                          selectedKeys={new Set([preferences.timezone])}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            handlePreferenceChange('timezone', value);
                          }}
                          disallowEmptySelection
                          size="sm"
                          aria-label="Timezone"
                          classNames={{
                            trigger: 'bg-neutral border-neutral-4',
                            value: 'body-16-regular text-neutral-9',
                            selectorIcon: 'text-neutral-9',
                          }}
                        >
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} className="body-16-regular text-neutral-9">
                              {tz.value === 'auto' && detectedTimezone
                                ? `Auto detect (${detectedTimezone})`
                                : tz.label}
                            </SelectItem>
                          ))}
                        </Select>
                        <p className="caption-14-regular text-neutral-6 mt-1">
                          Used to accurately timestamp conversations
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </ModalBody>
              <ModalFooter className="flex justify-center gap-3 pb-6 xl:!pb-8 pt-2 xl:!pt-4 px-4 xl:!px-6">
                <Button
                  variant="bordered"
                  onPress={onModalClose}
                  isDisabled={isSaving}
                  className="border-2 border-neutral-9 text-neutral-9 w-full xl:!w-auto py-4 body-16-semi xl:!text-[18px] rounded-full hover:bg-neutral-1"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleSave}
                  isDisabled={!hasChanges}
                  isLoading={isSaving}
                  className="bg-neutral-9 text-neutral w-full xl:!w-auto py-6 body-16-semi xl:!text-[18px] rounded-full hover:bg-slate-800 disabled:opacity-50"
                  size="lg"
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}