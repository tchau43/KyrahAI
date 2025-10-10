'use client';

import Image from 'next/image';
import { useModalStore } from '@/store/useModalStore';

export default function HeroSection() {
  const { openModal } = useModalStore();
  return (
    <section className="col-span-12 w-[87.5%] xl:w-[80%] 2xl:w-[70%] xl:h-[500px] 2xl:h-[600px] max-w-7xl mt-3 flex flex-col">
      <div className="w-full flex flex-col gap-16 h-full xl:grid xl:grid-cols-12 items-center xl:pt-10 2xl:pt-0">
        {/* Left Content */}
        <div className="xl:col-start-1 xl:col-span-6 flex flex-col gap-8 md:gap-16 z-10">
          <div className="flex flex-col gap-4">
            <p className="text-neutral-9 body-18-semi font-inter text-center xl:text-left">
              Your Quiet Ally in Emotional Awareness
            </p>
            <h1 className="text-neutral-9 heading-32 md:!text-[3.375rem] xl:!text-[4.5rem] xl:!tracking-[-0.06rem] text-center xl:text-left">
              We make <span className="text-neutral-10">AI safer</span>
              <br />
              for humanity
            </h1>
            <p className="text-neutral-9 body-18-regular max-w-lg text-center xl:text-left">
              Kyrah.ai offers compassionate and confidential support for anyone
              facing abuse or emotional harm. <br className='md:hidden' /> <br className='md:hidden' /> You are not alone.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="gap-4 md:grid md:grid-cols-6 flex flex-col">
            <button
              onClick={() => openModal('begin-modal')}
              className="px-8 py-3 md:col-span-3 bg-neutral-10 text-white rounded-full font-inter body-16-semi hover:bg-neutral-9 transition-colors cursor-pointer"
            >
              Chat with Kyrah (Alpha test)
            </button>
            <button className="px-8 py-3 md:col-span-3 bg-transparent border border-neutral-6 text-neutral-10 rounded-full font-inter body-16-semi hover:bg-neutral-1 transition-colors cursor-pointer">
              Watch Demo
            </button>
          </div>
        </div>


        <div className="xl:col-span-6 xl:col-start-7 xl:h-full relative h-80 md:h-100 w-full">
          <div className="absolute bottom-[-20] md:bottom-[-10] xl:bottom-[0] 2xl:bottom-[-30] right-0 w-full h-full">
            <Image
              src="/hero-image.png"
              alt="Hero Image"
              fill
              className="object-contain scale-[2] md:scale-150 xl:scale-[2.1]" />
          </div>
        </div>
      </div>
    </section>
  );
}
