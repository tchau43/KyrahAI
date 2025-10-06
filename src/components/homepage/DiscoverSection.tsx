import React from 'react';
import Image from 'next/image';
import { CheckIcon } from '../icons';

export default function DiscoverSection() {
  return (
    <section className="col-span-12 w-full grid grid-cols-12 h-full max-h-[880px]">
      {/* Left image */}
      <div className="relative col-span-12 md:col-span-6">
        <Image
          src="/coach.jpg"
          alt="coach"
          width={720}
          height={880}
          className="w-full h-auto object-cover object-center"
          priority
        />
      </div>

      {/* Right content */}
      <div className="col-span-12 md:col-span-6  bg-neutral-9 text-white flex items-start pt-[11.5rem] pl-[7.5rem]">
        <div className="max-w-lg">
          <p className="body-18-semi mb-8">
            Care should feel natural, not complicated.
          </p>

          <h2 className="heading-54 mb-20">
            Discover the support <br />
            Kyrah brings to you
          </h2>

          <ul className="space-y-5">
            <li className="flex items-start gap-3">
              <CheckIcon fill="white" size={24} />
              <span className="text-neutral font-inter leading-[1.6]">
                <span className="font-bold">24/7 availability</span> — gently
                notices and understands subtle shifts in your mood and feelings.
              </span>
            </li>

            <li className="flex items-start gap-3">
              <CheckIcon fill="white" size={24} />
              <span className="text-neutral font-inter leading-[1.6]">
                <span className="font-bold">Emotion recognition</span> — gently
                notices and understands subtle shifts in your mood and feelings.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon fill="white" size={24} />
              <span className="text-neutral font-inter leading-[1.6]">
                <span className="font-bold">Personalized responses</span> —
                adapts naturally to your unique style of communication and
                expression.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon fill="white" size={24} />
              <span className="text-neutral font-inter leading-[1.6]">
                <span className="font-bold">Safe space design</span> — private,
                secure, and thoughtfully built to keep you comfortable at all
                times.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
