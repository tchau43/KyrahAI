import Quote from '../cards/Quote';
import { DashLineIcon } from '../icons';

export default function ActionSection() {
  return (
    <section className="col-span-12 w-full bg-neutral pt-16 md:pt-20 lg:pt-30 pb-10 md:pb-14 lg:pb-20 flex justify-center">
      <div className="w-full md:w-[87.5%] xl:w-[80%] max-w-21xl px-4 md:px-0">
        <div className="flex flex-col gap-12 md:gap-20 lg:gap-30">
          <div className="flex flex-col xl:flex-row justify-between gap-8 md:gap-12 xl:gap-20">
            <div className="text-2xl md:text-3xl lg:text-4xl xl:heading-54 text-neutral-9 font-spectral font-semibold">
              Turning Awareness Into Action
            </div>
            <div className="xl:min-w-[300px]">
              <Quote />
            </div>
          </div>
          <div className="flex flex-col gap-12 md:gap-16 lg:gap-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 w-full">
                <div>
                  <DashLineIcon />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-xl md:text-2xl lg:heading-32 text-neutral-9 font-spectral font-semibold">
                    Human First
                  </div>
                  <div className="font-inter font-normal text-base md:text-lg leading-[1.6] text-neutral-9">
                    AI should amplify human judgment, never replace it.
                  </div>
                </div>
                <div className="font-inter font-bold text-xs md:text-sm leading-[1.6] text-neutral-9">
                  -Kyrah&apos;s values
                </div>
              </div>
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 w-full">
                <div>
                  <DashLineIcon />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-xl md:text-2xl lg:heading-32 text-neutral-9 font-spectral font-semibold">
                    Safety by Design
                  </div>
                  <div className="font-inter font-normal text-base md:text-lg leading-[1.6] text-neutral-9">
                    Privacy, confidentiality, and empowerment are at the core of
                    every feature.
                  </div>
                </div>
                <div className="font-inter font-bold text-xs md:text-sm leading-[1.6] text-neutral-9">
                  -Kyrah&apos;s values
                </div>
              </div>
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 w-full">
                <div>
                  <DashLineIcon />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-xl md:text-2xl lg:heading-32 text-neutral-9 font-spectral font-semibold">
                    Truth to Power
                  </div>
                  <div className="font-inter font-normal text-base md:text-lg leading-[1.6] text-neutral-9">
                    We reveal gaslighting, manipulation, and coercion that
                    silence vulnerable voices.
                  </div>
                </div>
                <div className="font-inter font-bold text-xs md:text-sm leading-[1.6] text-neutral-9">
                  -Kyrah&apos;s values
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-22">
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 w-full">
                <div>
                  <DashLineIcon />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-xl md:text-2xl lg:heading-32 text-neutral-9 font-spectral font-semibold">
                    Compassion at Scale
                  </div>
                  <div className="font-inter font-normal text-base md:text-lg leading-[1.6] text-neutral-9">
                    Every individual matters, and together we&apos;re building
                    to protect millions worldwide.
                  </div>
                </div>
                <div className="font-inter font-bold text-xs md:text-sm leading-[1.6] text-neutral-9">
                  -Kyrah&apos;s values
                </div>
              </div>
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 w-full">
                <div>
                  <DashLineIcon />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-xl md:text-2xl lg:heading-32 text-neutral-9 font-spectral font-semibold">
                    Transparency and Trust
                  </div>
                  <div className="font-inter font-normal text-base md:text-lg leading-[1.6] text-neutral-9">
                    Guided by global research, our methods are designed to be
                    explainable and accountable.
                  </div>
                </div>
                <div className="font-inter font-bold text-xs md:text-sm leading-[1.6] text-neutral-9">
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
