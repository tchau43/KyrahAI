'use client';

import Image from 'next/image';
import { CheckIcon } from '@/components/icons';
import Link from 'next/link';

const ViewMoreButton = () => (
  <Link
    href="/about"
    className="body-18-semi text-neutral-9 w-full rounded-full border border-neutral-9 px-28 py-3.5 cursor-pointer text-center"
  >
    View more
  </Link>
);

export default function MissionSection() {
  return (
    <section className="col-span-12 w-full bg-neutral">
      <div className="w-[87.5%] xl:w-[80%] 2xl:w-[70%] max-w-7xl mx-auto flex flex-col gap-4 md:gap-8">
        <div className="body-16-medium md:!font-semibold md:!text-[1.125rem] md:!leading-[140%] text-neutral-9">
          {/* <div className="body-16-regular md:!text-[1.125rem] md:!leading-[140%] xl:!text-[1.25rem] xl:!leading-[130%] text-neutral-9"> */}
          Care shouldn&apos;t be a battle
        </div>
        <div className="heading-28 md:!font-medium md:!text-[2.5rem] md:!tracking-[-0.06rem] xl:!font-semibold xl:!text-[3.5rem] xl:!tracking-[-0.06rem] xl:!leading-[1.1] text-neutral-9">
          Our mission is to make care simple, safe, and human.
        </div>
        <div className="w-full flex flex-col gap-8 xl:grid xl:grid-cols-12 items-center pb-20">
          {/* Content */}
          <div className="xl:col-start-1 xl:col-span-6 flex flex-col gap-4 md:gap-8 z-10">
              <div className="flex-col gap-4 md:gap-8 grid grid-cols-12">
                <div className="col-span-12 body-16-regular md:!text-[1.125rem] md:!leading-[140%] xl:!text-[1.25rem] xl:!leading-[130%] text-neutral-9">
                  Kyrah.ai exists to confront one of the world&apos;s most hidden and
                  urgent crises: the often overlooked early signs of emotional abuse,
                  manipulation, and violence.
                </div>
                <div className="col-span-12 body-16-regular md:!text-[1.125rem] md:!leading-[140%] xl:!text-[1.25rem] xl:!leading-[130%] text-neutral-9">
                  By combining AI with insights from psychology and global safety research, we’re creating tools that make a real difference:                </div>
              </div>
            <div className="flex flex-col gap-6 xl:gap-12 mt-2">
              <div className="body-16-regular md:!text-[1.125rem] md:!leading-[140%] xl:!text-[1.25rem] xl:!leading-[130%] text-neutral-9">
                <ul className="flex flex-col gap-2">
                  <li className="flex items-start gap-3.5">
                    <span className="mt-1 flex-shrink-0"><CheckIcon /></span>
                    Harness AI with psychological and safety insights.
                  </li>
                  <li className="flex items-start gap-3.5">
                    <span className="mt-1 flex-shrink-0"><CheckIcon /></span>
                    Builds tools that support people, especially women and vulnerable
                    groups.
                  </li>
                  <li className="flex items-start gap-3.5">
                    <span className="mt-1 flex-shrink-0"><CheckIcon /></span>
                    Detect red flags early, before risks escalate.
                  </li>
                  <li className="flex items-start gap-3.5">
                    <span className="mt-1 flex-shrink-0"><CheckIcon /></span>
                    Encourages clear responses and provides access to trusted support.
                  </li>
                </ul>
              </div>
              {/* Button for xl+ screens */}
              <div className="hidden xl:block">
                <ViewMoreButton />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="xl:col-span-6 xl:col-start-7 xl:h-full relative h-80 md:h-100 w-full">
            <div className="absolute bottom-0 right-0 w-full h-full">
              <Image
                src="/plant.svg"
                alt="Plant"
                fill
                // sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </div>

          {/* Button - only show on mobile/tablet, hidden on xl+ */}
          <div className="xl:hidden flex justify-center w-full">
            <ViewMoreButton />
          </div>
        </div>
      </div>
    </section>
  );
}
