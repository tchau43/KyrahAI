import Image from 'next/image';
import { stepData } from '@/features/safety-tips/data';

export default function SafetySteps() {
  return (
    <section className="col-span-12 w-full bg-secondary-1 grid grid-cols-12 gap-6">
      <div className="col-span-6">
        <div className="relative h-[1100px] w-full">
          <Image
            src="/walking.jpg"
            fill
            alt="walking"
            className="object-cover"
          />
        </div>
      </div>
      <div className="col-span-6 overflow-auto h-[1100px] scrollbar-hide">
        <div className="py-26 px-20">
          <div className="flex flex-col gap-[5.804rem]">
            {stepData.map(step => (
              <div key={step.id} className="flex flex-col gap-2 text-neutral">
                <div className="font-spectral font-semibold text-[1.375rem] leading-[110%]">
                  {step.id}
                </div>
                <div className="font-spectral font-semibold text-[2rem] leading-[110%] tracking-tight">
                  {step.title}
                </div>
                <div className="font-inter font-normal leading-[160%]">
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
