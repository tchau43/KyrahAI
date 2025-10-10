import Image from 'next/image';
import { stepData } from '@/features/safety-tips/data';

export default function SafetySteps() {
  return (
    <section className="col-span-12 w-full bg-secondary-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
      {/* Image Section */}
      <div className="lg:col-span-6 order-1">
        <div className="relative h-[500px] md:h-[1011px] lg:h-[800px] xl:h-[1100px] w-full overflow-hidden">
          <Image
            src="/walking.jpg"
            fill
            alt="walking"
            className="object-cover object-top"
            priority
          />
        </div>
      </div>

      {/* Steps Section */}
      <div className="lg:col-span-6 order-2 overflow-auto h-auto md:h-[1011px] lg:h-[800px] xl:h-[1100px] scrollbar-hide">
        <div className="py-12 md:py-16 lg:py-20 xl:py-26 px-6 md:px-12 lg:px-16 xl:px-20">
          <div className="flex flex-col gap-12 md:gap-16 lg:gap-20 xl:gap-[5.804rem]">
            {stepData.map(step => (
              <div key={step.id} className="flex flex-col gap-2 text-neutral">
                <div className="font-spectral font-semibold text-[22px] leading-[110%]">
                  {step.id}
                </div>
                <div className="font-spectral font-semibold text-[32px] leading-[110%] tracking-tight">
                  {step.title}
                </div>
                <div className="font-inter font-normal text-[16px] leading-[160%]">
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
