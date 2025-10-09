'use client';

import { useState, useMemo } from 'react';
import { Input, Select, SelectItem, Checkbox, Textarea } from '@heroui/react';
import { useGetAllCountries } from '@/features/homepage/hooks/useGetAllCountry';
import Link from 'next/link';
import Image from 'next/image';

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: countries, isLoading } = useGetAllCountries();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    console.log('Form submitted:', formData);
  };

  // Sort countries alphabetically
  const sortedCountries = useMemo(
    () =>
      countries
        ? [...countries].sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        )
        : [],
    [countries]
  );

  return (
    <section className="col-span-12 w-full bg-secondary-2">
      <div className="w-[87.5%] xl:w-[80%] 2xl:w-[70%] max-w-7xl mx-auto">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 items-center gap-12 py-16 md:py-20 xl:py-20 xl:pb-40">
          {/* Left: Form content */}
          <div className="col-span-1 md:col-span-12 xl:col-start-1 xl:col-span-6">
            <div className="bg-neutral rounded-2xl px-6 py-8 md:px-8 md:py-10">
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <h2 className="heading-28 text-center md:!text-[2.5rem] md:!font-medium md:!tracking-[-0.07rem] w-full xl:whitespace-nowrap text-neutral-11">
                  Help Shape <br className="md:hidden"/> the Future of Kyrah
                </h2>

                <div className="text-center text-neutral-11 body-16-regular">
                  <p>
                    Get early access to Kyrah.ai and explore new features early.
                  </p>
                  <p>Your feedback will help us grow and improve together.</p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Name inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      aria-label="First Name"
                      placeholder="First Name"
                      value={formData.firstName}
                      variant="bordered"
                      onChange={e => handleInputChange('firstName', e.target.value)}
                      classNames={{
                        input: 'placeholder:text-neutral-5 text-neutral-11 font-inter',
                        inputWrapper: 'border border-neutral-2',
                      }}
                      isInvalid={!!errors.firstName}
                      errorMessage={errors.firstName}
                    />
                    <Input
                      aria-label="Last Name"
                      placeholder="Last Name"
                      value={formData.lastName}
                      variant="bordered"
                      onChange={e => handleInputChange('lastName', e.target.value)}
                      classNames={{
                        input: 'placeholder:text-neutral-5 text-neutral-11 font-inter',
                        inputWrapper: 'border border-neutral-2',
                      }}
                      isInvalid={!!errors.lastName}
                      errorMessage={errors.lastName}
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
                      input: 'placeholder:text-neutral-5 text-neutral-11 font-inter',
                      inputWrapper: 'border border-neutral-2',
                    }}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                  />

                  {/* Country select */}
                  <Select
                    aria-label="Your country"
                    placeholder="Your country"
                    selectedKeys={
                      formData.country ? new Set([formData.country]) : new Set()
                    }
                    isLoading={isLoading}
                    onSelectionChange={keys => {
                      const [key] = Array.from(keys as Set<string>);
                      handleInputChange('country', key ?? '');
                    }}
                    classNames={{
                      trigger:
                        'border border-neutral-2 bg-neutral data-[hover=true]:bg-neutral data-[hover=true]:border-neutral-4 transition-colors',
                      value: 'text-neutral-5 font-inter',
                      selectorIcon: 'text-neutral-5',
                    }}
                    isInvalid={!!errors.country}
                    errorMessage={errors.country}

                  >
                    {sortedCountries.map(country => (
                      <SelectItem
                        className='text-neutral-5 font-inter'
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
                      input: 'placeholder:text-neutral-5 text-neutral-11 min-h-[100px] font-inter',
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
                        label: 'caption-14-regular text-neutral-8',
                      }}
                    >
                      I agree to the{' '}
                      <Link
                        href="/terms-of-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline hover:text-neutral-9"
                        onClick={e => {
                          e.stopPropagation();
                        }}
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline hover:text-neutral-9"
                        onClick={e => {
                          e.stopPropagation();
                        }}
                      >
                        Privacy Policy
                      </Link>{' '}
                      , and{' '}
                      <span className="font-semibold">
                        I understand that Kyrah.ai is not a medical or emergency
                        service
                      </span>
                    </Checkbox>
                    {errors.agreeToTerms && (
                      <span className="caption-14-regular text-error-2 mt-1">
                        {errors.agreeToTerms}
                      </span>
                    )}

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
                      Yes, I would like to receive email updates about Kyrah.ai.
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

          {/* Right: Image - Hidden on mobile, visible on md+ */}
          <div className="md:col-span-12 xl:col-start-7 xl:col-span-6 relative h-80 md:h-96 xl:h-full">
            <div className="absolute bottom-0 right-0 w-full h-full">
              <Image
                src="/roller-skating.png"
                alt="Roller Skating"
                fill
                // sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
