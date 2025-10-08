'use client';

import Image from 'next/image';
import { useModalStore } from '@/store/useModalStore';

export default function HeroSection() {
  const { openModal } = useModalStore();
  return (
    <section className="col-span-12 w-[87.5%] xl:w-[80%] xl:h-[600px] max-w-21xl mt-3">
      <div className="w-full grid grid-cols-1 md:grid-cols-12 items-center pt-40">
        {/* Left Content */}
        <div className="md:col-start-1 md:col-span-6 flex flex-col gap-16 z-10">
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
          <div className="gap-4 grid grid-cols-7">
            <button
              onClick={() => openModal('begin-modal')}
              className="px-8 py-3 col-span-3 bg-neutral-10 text-white rounded-full font-inter body-16-semi hover:bg-neutral-9 transition-colors cursor-pointer"
            >
              Chat with Kyrah (Alpha test)
            </button>
            <button className="px-8 py-3 col-span-3 bg-transparent border border-neutral-6 text-neutral-10 rounded-full font-inter body-16-semi hover:bg-neutral-1 transition-colors cursor-pointer">
              Watch Demo
            </button>
          </div>
        </div>


        <div className="col-span-6 col-start-7 h-full relative">
          <div className="absolute bottom-0 right-0 w-full h-full">
            <Image
              src="/hero-image.png"
              alt="Hero Image"
              fill
              className="object-contain scale-100 xl:scale-160"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
