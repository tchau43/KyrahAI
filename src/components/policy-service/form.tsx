import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import PolicySidebar from '@/components/policy/PolicySidebar';
import { PolicyProps } from '@/features/policy/types';

interface PolicyPageProps {
    title: string;
    description: string;
    effectiveDate: string;
    illustrationSrc: string;
    illustrationAlt: string;
    policies: PolicyProps[];
}

export default function PolicyPage({
    title,
    description,
    effectiveDate,
    illustrationSrc,
    illustrationAlt,
    policies,
}: PolicyPageProps) {
    return (
        <div className="min-h-screen">
            {/* Logo - Outside hero section */}
            <div className="bg-primary px-6 py-16 md:px-12 xl:px-24">
                <div className="mx-auto max-w-7xl">
                    <Link href="/">
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
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="bg-primary px-6 pb-20 md:px-12 xl:px-24">
                <div className="mx-auto max-w-7xl">
                    <div className="xl:grid gap-12 xl:grid-cols-2 flex flex-col ">
                        {/* Left Content */}
                        <div className="flex flex-col justify-center">
                            <div className="space-y-6 pb-16">
                                {/* Title */}
                                <h1 className="display text-[2rem] md:text-[3.5rem] xl:text-[4.5rem] font-semibold text-neutral-9">
                                    {title}
                                </h1>

                                {/* Description */}
                                <p className="body-16-regular md:!text-[1.125rem] text-neutral-9">
                                    {description}
                                </p>

                                {/* Effective Date */}
                                <p className="body-16-regular text-neutral-9 pt-10">
                                    {effectiveDate}
                                </p>
                            </div>
                        </div>

                        {/* Right Illustration */}
                        <div className="flex justify-center">
                            <div className="relative  pb-16 w-full max-w-[724px] h-[593px] order-2 xl:order-none">
                                <Image
                                    src={illustrationSrc}
                                    alt={illustrationAlt}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="-mt-6 rounded-t-3xl bg-neutral px-6 py-16 md:px-12 xl:px-24">
                <div className="mx-auto max-w-7xl flex flex-col">
                    <div className="grid gap-12 xl:grid-cols-[3fr_1fr]">
                        {/* Main Content */}
                        <div className="space-y-12">
                            {policies.map((policy: PolicyProps) => (
                                <div key={policy.id} id={policy.id} className="space-y-4">
                                    <h2 className="body-18-regular md:!text-[1.375rem] uppercase tracking-wide text-neutral-9">
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
                        <div className="order-first xl:order-none">
                            <PolicySidebar policies={policies} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}


