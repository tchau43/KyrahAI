'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SafetySection() {
  const router = useRouter();

  return (
    <section className="col-span-12 w-full bg-neutral z-[60] pt-7.5 pb-16 md:pb-20">
      <div className="w-[87.5%] xl:w-[80%] 2xl:w-[70%] max-w-7xl mx-auto flex flex-col gap-4 md:gap-8">
        <div className="flex flex-col gap-2.5 text-neutral-9">
          <div className="body-16-medium md:!font-semibold xl:!text-[1.125rem] xl:!font-semibold">Safety tips</div>
          <div>
            <div className="heading-28 md:!text-[2.5rem] md:!tracking-[-0.06rem] xl:!text-[3.375rem] xl:!tracking-[-0.06rem]">Stay Safe,</div>
            <div className="heading-28 md:!text-[2.5rem] md:!tracking-[-0.06rem] xl:!text-[3.375rem] xl:!tracking-[-0.06rem]">Stay in Control</div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-4 md:gap-8 xl:grid xl:grid-cols-12 items-center">
          {/* Image */}
          <div className="xl:col-span-6 xl:col-start-1 xl:h-full relative h-80 md:h-100 w-full">
            <div className="absolute bottom-0 right-0 w-full h-full">
              <Image
                src="/reading-side.svg"
                alt="Safety Section"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Content */}
          <div className="xl:col-span-6 xl:col-start-7 flex flex-col gap-4 text-neutral-9">
            <div className="body-16-regular md:!text-[1.25rem] md:!leading-[130%]">
              These quick steps can help you stay aware and protect yourself in
              everyday situations:
            </div>
            <ul className="list-disc body-16-regular md:!text-[1.25rem] md:!leading-[130%] pl-5">
              <li>
                <span className="font-bold">Use Quick-Exit:</span> Practice using it
                before you need it.
              </li>
              <li>
                <span className="font-bold">Browse privately:</span> Use incognito
                windows and clear history if needed.
              </li>
              <li>
                <span className="font-bold">Device safety:</span> Turn off
                auto-backup for sensitive screenshots.
              </li>
            </ul>
            <button
              className="body-18-semi w-full xl:w-max rounded-full border border-neutral-9 px-28 py-3.5 mt-8 md:mt-14 cursor-pointer"
              onClick={() => {
                router.push('/safety-tips');
              }}
            >
              View more
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
