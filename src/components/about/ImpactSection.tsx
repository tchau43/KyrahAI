import { LongDashLineIcon } from '../icons';

export default function ImpactSection() {
  return (
    <section className="col-span-12 w-full bg-neutral-1 py-12 md:py-16 lg:py-20 xl:py-25 flex justify-center">
      <div className="w-full md:w-[87.5%] xl:w-[80%] max-w-21xl px-4 md:px-0">
        <div className="flex flex-col gap-8 md:gap-10 lg:gap-12">
          <div className="text-2xl md:text-3xl lg:text-4xl xl:heading-54 text-neutral-9 font-spectral font-semibold">
            Our Impact
          </div>

          <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8 md:gap-10 lg:gap-12">
            <div className="xl:col-span-4 flex flex-col gap-6 md:gap-8 md:justify-between">
              <div className="font-inter font-medium text-base md:text-lg leading-[1.6] text-neutral-9 md:max-w-[70%] xl:max-w-none">
                Kyrah.ai is aligned with the United Nations Sustainable
                Development Goals, including:
              </div>
              <div className="rounded-2xl bg-secondary-3 p-5 md:p-6 lg:p-7.5 flex flex-col gap-8 md:gap-10 xl:gap-12.5 text-neutral-10 w-full md:w-[50%] xl:w-full">
                <div className="flex flex-col gap-1.5">
                  <div className="text-5xl md:text-6xl lg:text-7xl xl:display font-spectral font-semibold">
                    SDG 3
                  </div>
                  <div className="text-base md:text-lg lg:body-18-semi">
                    Good Health & Well-Being
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-inter font-bold text-base md:text-lg leading-[1.3]">
                    24/7
                  </div>
                  <div className="text-sm md:text-base lg:body-16-regular">
                    Mental & emotional support
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 xl:self-end">
              <div className="rounded-2xl bg-primary p-5 md:p-6 lg:p-7.5 flex flex-col gap-8 md:gap-10 xl:gap-52.5 text-neutral-10 w-full md:w-[70%] xl:w-full xl:h-[70%]">
                <div className="flex flex-col gap-1.5">
                  <div className="text-5xl md:text-6xl lg:text-7xl xl:display font-spectral font-semibold">
                    SDG 5
                  </div>
                  <div className="text-base md:text-lg lg:body-18-semi">
                    Gender Equality
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-inter font-bold text-base md:text-lg leading-[1.3]">
                    70%
                  </div>
                  <div className="text-sm md:text-base lg:body-16-regular">
                    Women & girls empowered
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 flex flex-col gap-8 md:gap-10 lg:gap-12">
              <div className="rounded-2xl bg-secondary-1 p-5 md:p-6 lg:p-7.5 flex flex-col gap-8 md:gap-10 xl:gap-50.75 text-neutral-10 w-full md:w-[100%] xl:w-full">
                <div className="flex flex-col gap-1.5">
                  <div className="text-5xl md:text-6xl lg:text-7xl xl:display text-neutral font-spectral font-semibold">
                    SDG 16
                  </div>
                  <div className="text-base md:text-lg lg:body-18-semi text-neutral">
                    Peace, Justice and Strong Institutions
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-inter font-bold text-base md:text-lg leading-[1.3] text-neutral">
                    100%
                  </div>
                  <div className="text-sm md:text-base lg:body-16-regular text-neutral">
                    Safer, transparent communities
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 items-end text-right md:ml-auto md:max-w-[80%] xl:max-w-none">
                <div>
                  <LongDashLineIcon />
                </div>
                <div className="font-spectral font-semibold text-lg md:text-xl lg:text-2xl text-neutral-9">
                  Early in our journey, we work to
                </div>
                <div className="font-inter italic font-normal text-sm md:text-base flex flex-col text-neutral-9">
                  <div>End gender-based violence,</div>
                  <div>Support emotional well-being,</div>
                  <div>and Build safer communities worldwide.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
