import React from 'react';
import Image from 'next/image';
import { CheckIcon } from '../icons';

export default function DiscoverSection() {
  return (
    <section className="col-span-12 w-full flex flex-col-reverse xl:grid xl:grid-cols-12 h-auto xl:max-h-[880px]">
      {/* Left image */}
      <div className="relative col-span-12 xl:col-span-6">
        <Image
          src="/coach.jpg"
          alt="coach"
          width={720}
          height={880}
          className="w-full h-[380px] md:h-[700px] lg:h-[880px] xl:h-full object-cover object-top xl:object-contain scale-110 xl:scale-100"
          priority
        />
      </div>

      {/* Right content */}
      <div className="col-span-12 xl:col-span-6 bg-neutral-9 text-white flex items-start px-6 py-12 md:px-10 md:py-16 xl:pt-[11.5rem] xl:pl-[7.5rem] xl:pr-0 xl:pb-0 ">
        <div className=" xl:w-full mx-auto">
          <p className="body-16-semi xl:text-[1.125rem] mb-6 xl:mb-8">
            Care should feel natural, not complicated.
          </p>

          <h2 className="heading-28 md:!text-[2.5rem] md:!font-medium md:!tracking-[-0.07rem] xl:!font-semibold xl:!text-[3.375rem] xl:!tracking-[-0.06rem] mb-10 xl:mb-20">
            Discover the support <br className='hidden xl:block' />
            Kyrah brings to you
          </h2>

          <ul className="space-y-4 xl:space-y-5">
            <li className="flex items-start gap-3">
              <CheckIcon fill="white" size={24} />
              <span className="text-neutral font-inter leading-[1.6]">
                <span className="font-bold">24/7 availability</span> — always here to support you, day <br className='hidden xl:block' /> or night, whenever you reach out.
              </span>
            </li>

            <li className="flex items-start gap-3">
              <CheckIcon fill="white" size={24} />
              <span className="text-neutral font-inter leading-[1.6]">
                <span className="font-bold">Emotion recognition</span> — gently
                notices and <br className='hidden xl:block' /> understands subtle shifts in your mood and feelings.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon fill="white" size={24} />
              <span className="text-neutral font-inter leading-[1.6]">
                <span className="font-bold">Personalized responses</span> —
                adapts naturally to your <br className='hidden xl:block' /> unique style of communication and
                expression.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon fill="white" size={24} />
              <span className="text-neutral font-inter leading-[1.6]">
                <span className="font-bold">Safe space design</span> — private,
                secure, and thoughtfully <br className='hidden xl:block' /> built to keep you comfortable at all
                times.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
