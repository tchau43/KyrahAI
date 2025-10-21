'use client';

import ResourceCard from '../cards/ResourceCard';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

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
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Recalculate and sync min-heights so all cards have the same title/desc line counts
  useEffect(() => {
    const measureAndSync = () => {
      const container = gridRef.current;
      if (!container) return;

      const titleNodes = container.querySelectorAll<HTMLElement>('[data-rc-title]');
      const descNodes = container.querySelectorAll<HTMLElement>('[data-rc-desc]');

      // Reset before measuring to get natural heights
      container.style.removeProperty('--rc-title-min-h');
      container.style.removeProperty('--rc-desc-min-h');

      let maxTitle = 0;
      titleNodes.forEach((n) => {
        // Temporarily clear minHeight if inherited via parent var
        const prev = n.style.minHeight;
        n.style.minHeight = 'auto';
        const h = n.scrollHeight;
        if (h > maxTitle) maxTitle = h;
        n.style.minHeight = prev;
      });

      let maxDesc = 0;
      descNodes.forEach((n) => {
        const prev = n.style.minHeight;
        n.style.minHeight = 'auto';
        const h = n.scrollHeight;
        if (h > maxDesc) maxDesc = h;
        n.style.minHeight = prev;
      });

      if (maxTitle > 0) container.style.setProperty('--rc-title-min-h', `${maxTitle}px`);
      if (maxDesc > 0) container.style.setProperty('--rc-desc-min-h', `${maxDesc}px`);
    };

    measureAndSync();

    // Observe resizes of window and content
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measureAndSync, 50);
    };
    window.addEventListener('resize', onResize);

    // ResizeObserver on title/desc nodes
    const ro = new ResizeObserver(() => measureAndSync());
    const container = gridRef.current;
    const titleNodes = container?.querySelectorAll<HTMLElement>('[data-rc-title]') ?? [];
    const descNodes = container?.querySelectorAll<HTMLElement>('[data-rc-desc]') ?? [];
    titleNodes.forEach((n) => ro.observe(n));
    descNodes.forEach((n) => ro.observe(n));

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      if (typeof resizeTimer !== 'undefined') window.clearTimeout(resizeTimer);
    };
  }, []);

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
          <div ref={gridRef} className="flex flex-col xl:grid xl:grid-cols-9 gap-10">
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
        <div className="xl:hidden pt-4">
          <button
            className="body-18-semi w-full rounded-full border border-neutral text-neutral px-6 py-2.5 cursor-pointer hidden md:block"
            onClick={() => {
              router.push('/resource');
            }}
          >
            Find your local 24/7 confidential support
          </button>
          <button
            className="body-18-semi w-full rounded-full border border-neutral text-neutral px-6 py-2.5 cursor-pointer md:hidden"
            onClick={() => {
              router.push('/resource');
            }}
          >
            Find your local support
          </button>
        </div>
      </div>
    </section>
  );
}
