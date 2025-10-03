import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import { termsPolicy } from '@/features/policy/data';
import { PolicyProps } from '@/features/policy/types';
import PolicySidebar from '@/components/policy/PolicySidebar';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      {/* Logo - Outside hero section */}
      <div className="bg-primary px-6 py-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <Image
              src="/kyrah-logo.svg"
              alt="Kyrah.ai Logo"
              width={45}
              height={45}
              className="h-12 w-12"
            />
            <span className="font-inder text-3xl font-medium text-neutral-9">
              KYRAH.AI
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-primary px-6 pb-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="space-y-6 pb-16">
              {/* Title */}
              <h1 className="display text-5xl font-medium text-neutral-9 md:text-6xl lg:text-7xl">
                Terms of Service
              </h1>

              {/* Description */}
              <p className="body-18-regular text-neutral-9 md:text-lg">
                By using Kyrah.ai, you agree to the following terms. These
                guidelines exist to protect you and ensure a safe, supportive
                experience.
              </p>

              {/* Effective Date */}
              <p className="body-16-regular text-neutral-9 pt-10">
                Effective September 23, 2025
              </p>
            </div>

            {/* Right Illustration */}
            <div className="flex justify-center pb-16 lg:justify-end relative w-full max-w-[724px] h-[593px]">
              <Image
                src="/unboxing.svg"
                alt="Terms of Service Illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="-mt-6 rounded-t-3xl bg-neutral px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[3fr_1fr]">
            {/* Main Content */}
            <div className="space-y-12">
              {termsPolicy.map((policy: PolicyProps) => (
                <div key={policy.id} id={policy.id} className="space-y-4">
                  <h2 className="text-xl uppercase tracking-wide text-neutral-9">
                    {policy.policyName}
                  </h2>
                  {Array.isArray(policy.policyContent) ? (
                    <ul className="space-y-3">
                      {policy.policyContent.map((item, index) => (
                        <li
                          key={index}
                          className="flex gap-3 text-neutral-9 items-center"
                        >
                          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2F3A56]" />
                          <span
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(item),
                            }}
                            className="leading-relaxed"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(policy.policyContent),
                      }}
                      className="leading-relaxed text-neutral-9"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar Navigation */}
            <PolicySidebar policies={termsPolicy} />
          </div>
        </div>
      </section>
    </div>
  );
}
