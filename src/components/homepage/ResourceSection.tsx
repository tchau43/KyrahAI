'use client';

import ResourceCard from '../cards/ResourceCard';
import { useRouter } from 'next/navigation';

const resourcesData = [
  {
    title: 'UNFPA GBV Dashboard',
    description: 'Country-level data and resources on gender-based violence',
    link: 'https://www.unfpa.org/GBV-dashboard/explorer/map?utm_source=chatgpt.com',
  },
  {
    title: 'UNHCR GBV Toolkit',
    description:
      'Guidance, tools, and resource lists for survivors and responders',
    link: 'https://www.unhcr.org/gbv-toolkit/guidance-and-tools?utm_source=chatgpt.com',
  },
  {
    title: 'Befrienders Worldwide',
    description: 'International suicide prevention hotlines at befrienders.org',
    link: 'https://befrienders.org/',
  },
];

export default function ResourceSection() {
  const router = useRouter();

  return (
    <section className="col-span-12 w-full bg-secondary-1 z-60 py-20">
      <div className="w-[87.5%] xl:w-[80%] 2xl:w-[70%] max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col gap-7.5 xl:grid xl:grid-cols-12">
          <div className="xl:col-span-7 flex flex-col gap-7.5">
            <div className="body-16-medium md:!text-[1.125rem] md:!font-semibold text-neutral">Resources & Hotlines</div>
            <div className="heading-28 md:!text-[2.5rem] md:!tracking-[-0.06rem] xl:!text-[3.375rem] xl:!tracking-[-0.06rem] text-neutral">Find Safety, Find Support</div>
          </div>
          <div className="xl:col-span-5 xl:pt-5 flex flex-col justify-between">
            <div className="body-18-regular text-neutral">
              <span className="font-spectral font-bold text-[1.25rem] xl:!text-[1.5rem]">
                <i>Kyrah.ai</i>
              </span>{' '}
              is not a medical, clinical, or emergency service. It is designed only
              to raise awareness of potential emotional risks in communication.
              <br />
              <br />
              <span>
                If you or someone you know is in immediate danger, please call{' '}
                <span className="font-bold">911 (U.S.)</span> or your local
                emergency number right away.
              </span>
            </div>
            {/* Button for xl+ screens */}
            <div className="hidden xl:block">
              <button
                className="body-18-semi w-max rounded-full border border-neutral text-neutral px-6 py-2.5 mt-10 cursor-pointer"
                onClick={() => {
                  router.push('/resource');
                }}
              >
                Find your local 24/7 confidential support
              </button>
            </div>
          </div>
        </div>

        {/* Global Resources Section */}
        <div className="flex flex-col gap-6">
          <div className="body-18-semi md:!text-[1.375rem] md:!font-bold md:!leading-[160%] pt-8 xl:!pt-15 text-neutral">Global Resources</div>
          <div className="flex flex-col xl:grid xl:grid-cols-9 gap-10">
            {resourcesData.map((resource, index) => (
              <ResourceCard
                key={index}
                title={resource.title}
                description={resource.description}
                isFirst={index === 0}
                link={resource.link}
              />
            ))}
          </div>
        </div>

        {/* Second button for mobile/tablet - only show on xl and below */}
        <div className="block xl:hidden">
          <button
            className="body-18-semi w-full rounded-full border border-neutral text-neutral px-6 py-2.5 cursor-pointer"
            onClick={() => {
              router.push('/resource');
            }}
          >
            Find your local 24/7 confidential support
          </button>
        </div>
      </div>
    </section>
  );
}
