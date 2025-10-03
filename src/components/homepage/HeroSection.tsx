'use client';

import Image from 'next/image';
import { useModalStore } from '@/store/useModalStore';

export default function HeroSection() {
  const { openModal } = useModalStore();
  return (
    <section className="col-span-12 w-full min-h-[600px] relative mt-3">
      <div className="w-full grid grid-cols-12 gap-8 items-center px-60 py-40 relative">
        {/* Left Content */}
        <div className="col-span-6 col-start-1 flex flex-col gap-16 z-10">
          <div className="flex flex-col gap-4">
            <p className="text-neutral-9 body-18-semi font-inter">
              Your Quiet Ally in Emotional Awareness
            </p>
            <h1 className="text-neutral-9 display">
              We make <span className="text-neutral-10">AI safer</span>
              <br />
              for humanity
            </h1>
            <p className="text-neutral-9 body-18-regular max-w-lg">
              Kyrah.ai offers compassionate and confidential support for anyone
              facing abuse or emotional harm. You are not alone.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="gap-4 grid grid-cols-12 h-14">
            <button
              onClick={() => openModal('begin-modal')}
              className="col-span-4 px-8 py-3.5 bg-neutral-10 text-white rounded-full font-inter body-16-semi hover:bg-neutral-9 transition-colors cursor-pointer"
            >
              Chat with Kyrah (Alpha test)
            </button>
            <button className="col-span-4 px-8 py-3.5 bg-transparent border border-neutral-6 text-neutral-10 rounded-full font-inter body-16-semi hover:bg-neutral-1 transition-colors cursor-pointer">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Right Image - Absolute positioned */}
        <div className="absolute right-20 top-16 w-1/2 h-full">
          <div className="relative w-full h-full scale-150">
            <Image
              src="/hero-image.png"
              alt="Hero Image"
              fill
              className="object-cover object-left"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
