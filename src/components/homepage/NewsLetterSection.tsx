'use client';

import { useState } from 'react';
import { Input, Select, SelectItem, Checkbox, Textarea } from '@heroui/react';
import { useGetAllCountries } from '@/features/homepage/hooks/useGetAllCountry';

export default function NewsLetterSection() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    message: '',
    agreeToTerms: false,
    receiveUpdates: false,
  });

  const { data: countries, isLoading } = useGetAllCountries();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  // Sort countries alphabetically
  const sortedCountries =
    countries?.sort((a, b) => a.name.common.localeCompare(b.name.common)) || [];

  return (
    <section className="col-span-12 w-full bg-secondary-2 px-60 pt-30 pb-40">
      <div className="grid grid-cols-12 gap-13 items-center justify-center">
        <div className="col-start-1 col-span-5 bg-neutral rounded-2xl px-8 py-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <h2 className="font-spectral font-medium text-neutral-11 text-[2.5rem] leading-[1.1] tracking-[-0.07] text-center w-full">
              Help Shape the Future of Kyrah
            </h2>

            <div className="text-center text-neutral-11 body-16-regular">
              <p>
                Get early access to Kyrah.ai and explore new features early.
              </p>
              <p>Your feedback will help us grow and improve together.</p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Name inputs */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  aria-label="First Name"
                  placeholder="First Name"
                  value={formData.firstName}
                  variant="bordered"
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  classNames={{
                    input: 'placeholder:text-neutral-5 font-inter',
                    inputWrapper: 'border border-neutral-2',
                  }}
                />
                <Input
                  aria-label="Last Name"
                  placeholder="Last Name"
                  value={formData.lastName}
                  variant="bordered"
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  classNames={{
                    input: 'placeholder:text-neutral-5 font-inter',
                    inputWrapper: 'border border-neutral-2',
                  }}
                />
              </div>

              {/* Email input */}
              <Input
                aria-label="Email Address"
                type="email"
                placeholder="Email Address"
                variant="bordered"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                classNames={{
                  input: 'placeholder:text-neutral-5 font-inter',
                  inputWrapper: 'border border-neutral-2',
                }}
              />

              {/* Country select */}
              <Select
                aria-label="Your country"
                placeholder="Your country"
                value={formData.country}
                onChange={e => handleInputChange('country', e.target.value)}
                isLoading={isLoading}
                classNames={{
                  trigger:
                    'border border-neutral-2 bg-neutral data-[hover=true]:bg-neutral data-[hover=true]:border-neutral-4 transition-colors',
                  value: 'text-neutral-5 font-inter',
                }}
              >
                {sortedCountries.map(country => (
                  <SelectItem
                    key={country.cca2}
                    textValue={country.flag + ' ' + country.name.common}
                  >
                    {country.flag} {country.name.common}
                  </SelectItem>
                ))}
              </Select>

              {/* Message textarea */}
              <Textarea
                aria-label="Anything you'd like to share with us?"
                placeholder="Anything you'd like to share with us?"
                value={formData.message}
                variant="bordered"
                onChange={e => handleInputChange('message', e.target.value)}
                classNames={{
                  input: 'placeholder:text-neutral-5 min-h-[100px] font-inter',
                  inputWrapper: 'border border-neutral-2',
                }}
              />

              {/* Checkboxes */}
              <div className="flex flex-col gap-3">
                <Checkbox
                  aria-label="I agree to the Terms of Service and Privacy Policy"
                  color="secondary"
                  isSelected={formData.agreeToTerms}
                  onValueChange={checked =>
                    handleInputChange('agreeToTerms', checked)
                  }
                  classNames={{
                    label: 'caption-14-regular text-neutral-11',
                  }}
                >
                  I agree to the{' '}
                  <span className="font-semibold underline">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold underline">
                    Privacy Policy
                  </span>{' '}
                  , and{' '}
                  <span className="font-semibold">
                    I understand that Kyrah.ai is not a medical or emergency
                    service
                  </span>
                </Checkbox>

                <Checkbox
                  aria-label="Yes, I would like to receive email updates about Kyrah.ai"
                  color="secondary"
                  isSelected={formData.receiveUpdates}
                  onValueChange={checked =>
                    handleInputChange('receiveUpdates', checked)
                  }
                  classNames={{
                    label: 'caption-14-regular text-neutral-11',
                  }}
                >
                  Yes, I would like to receive email updates about Kyrah.ai.*
                </Checkbox>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full body-18-semi rounded-full text-neutral bg-neutral-9 py-4 hover:bg-neutral-8 transition-colors"
              >
                Sign Up Securely
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
