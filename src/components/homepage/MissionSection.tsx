'use client';

import Image from 'next/image';
import { CheckIcon } from '@/components/icons';
import Link from 'next/link';

export default function MissionSection() {
  return (
    <section className="col-span-12 w-full bg-neutral">
      <div className="w-[87.5%] xl:w-[80%] 2xl:w-[70%] max-w-7xl mx-auto flex flex-col gap-8">
        <div className="body-18-semi text-neutral-9">
          Care shouldn&apos;t be a battle
        </div>
        <div className="w-[80%] heading-54 text-neutral-9">
          Our mission is to make care simple, safe, and human.
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-12 items-center pb-40">
          {/* Left Content */}
          <div className="md:col-start-1 md:col-span-6 flex flex-col gap-8 z-10">
            <div className="flex flex-col gap-8">

              <div className="flex-col gap-8 grid grid-cols-12">

                <div className="col-span-12 subtitle-20-regular text-neutral-9">
                  Kyrah.ai exists to confront one of the world&apos;s most hidden and
                  urgent crises: the often overlooked early signs of emotional abuse,
                  manipulation, and violence.
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 mt-2">
              <div className="subtitle-20-regular text-neutral-9">
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
              <Link
                href="/about"
                className="body-18-semi text-neutral-9 w-max rounded-full border border-neutral-9 px-28 py-3.5 mt-3 cursor-pointer"
              >
                View more
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="xl:col-start-7 xl:col-span-6 h-full relative">
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
        </div>
      </div>
    </section>
  );
}
