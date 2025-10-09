import Quote from '../cards/Quote';
import { DashLineIcon } from '../icons';

export default function ActionSection() {
  return (
    <section className="col-span-12 w-full bg-neutral pt-16 md:pt-20 lg:pt-30 rounded-t-2xl md:rounded-t-3xl pb-16 md:pb-24 lg:pb-[8.5rem] flex justify-center overflow-hidden relative z-3 -mt-4 md:-mt-5 lg:-mt-5 xl:-mt-6">
      <div className="w-full md:w-[87.5%] xl:w-[80%] max-w-21xl px-4 md:px-0">
        <div className="flex flex-col gap-12 md:gap-20 lg:gap-30">
          <div className="flex flex-col xl:flex-row justify-between gap-8 md:gap-12 xl:gap-20">
            <div className="flex flex-col md:!flex-row lg:!flex-row xl:!flex-col">
              <div className="heading-28 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral-9 whitespace-nowrap">
                Turning Awareness&nbsp;
              </div>
              <div className="heading-28 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral-9 whitespace-nowrap">
                Into Action
              </div>
            </div>
            <div className="xl:min-w-[300px] px-4">
              <Quote />
            </div>
          </div>
          <div className="flex flex-col gap-12 md:gap-12 lg:gap-12 xl:gap-20">
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10 lg:gap-10 xl:gap-22">
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 w-full">
                <div>
                  <DashLineIcon />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[32px] text-neutral-9 font-spectral font-semibold">
                    Human First
                  </div>
                  <div className="body-16-regular md:!text-[18px] lg:!text-[18px] xl:!text-[18px] text-neutral-9">
                    AI should amplify human judgment, never replace it.
                  </div>
                </div>
                <div className="caption-14-bold text-neutral-9">
                  -Kyrah&apos;s values
                </div>
              </div>
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 w-full">
                <div>
                  <DashLineIcon />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[32px] text-neutral-9 font-spectral font-semibold">
                    Safety by Design
                  </div>
                  <div className="body-16-regular md:!text-[18px] lg:!text-[18px] xl:!text-[18px] text-neutral-9">
                    Privacy, confidentiality, and empowerment are at the core of
                    every feature.
                  </div>
                </div>
                <div className="caption-14-bold text-neutral-9">
                  -Kyrah&apos;s values
                </div>
              </div>
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 w-full">
                <div>
                  <DashLineIcon />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[32px] text-neutral-9 font-spectral font-semibold">
                    Truth to Power
                  </div>
                  <div className="body-16-regular md:!text-[18px] lg:!text-[18px] xl:!text-[18px] text-neutral-9">
                    We reveal gaslighting, manipulation, and coercion that
                    silence vulnerable voices.
                  </div>
                </div>
                <div className="caption-14-bold text-neutral-9">
                  -Kyrah&apos;s values
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-8 md:gap-10 lg:gap-10 xl:gap-22">
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 w-full">
                <div>
                  <DashLineIcon />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[32px] text-neutral-9 font-spectral font-semibold">
                    Compassion at Scale
                  </div>
                  <div className="body-16-regular md:!text-[18px] lg:!text-[18px] xl:!text-[18px] text-neutral-9">
                    Every individual matters, and together we&apos;re building
                    to protect millions worldwide.
                  </div>
                </div>
                <div className="caption-14-bold text-neutral-9">
                  -Kyrah&apos;s values
                </div>
              </div>
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 w-full">
                <div>
                  <DashLineIcon />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[32px] text-neutral-9 font-spectral font-semibold">
                    Transparency and Trust
                  </div>
                  <div className="body-16-regular md:!text-[18px] lg:!text-[18px] xl:!text-[18px] text-neutral-9">
                    Guided by global research, our methods are designed to be
                    explainable and accountable.
                  </div>
                </div>
                <div className="caption-14-bold text-neutral-9">
                  -Kyrah&apos;s values
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
