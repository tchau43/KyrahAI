import { LongDashLineIcon } from '../icons';

export default function ImpactSection() {
  return (
    <section className="col-span-12 w-full bg-neutral-1 py-12 md:py-16 lg:py-20 xl:py-25 flex justify-center">
      <div className="w-full md:w-[87.5%] xl:w-[80%] px-4 md:px-0">
        <div className="flex flex-col gap-8 md:gap-10 lg:gap-12">
          <div className="heading-28 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral-9">
            Our Impact
          </div>

          <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8 md:gap-10 lg:gap-12">
            <div className="xl:col-span-4 flex flex-col gap-6 md:gap-8 md:justify-between">
              <div className="body-16-regular md:!text-[18px] lg:!text-[18px] xl:!text-[18px] text-neutral-9 md:max-w-[70%] xl:max-w-none">
                Kyrah.ai is aligned with the United Nations Sustainable
                Development Goals, including:
              </div>
              <div className="rounded-2xl bg-secondary-3 p-5 md:p-6 lg:p-7.5 flex flex-col gap-8 md:gap-10 xl:gap-12.5 text-neutral-10 w-full md:w-[50%] xl:w-full">
                <div className="flex flex-col gap-1.5">
                  <div className="heading-28 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral-10">
                    SDG 3
                  </div>
                  <div className="body-16-semi md:!text-[18px] lg:!text-[18px] xl:!text-[18px] text-neutral-10">
                    Good Health & Well-Being
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="body-16-semi text-neutral-10">24/7</div>
                  <div className="body-16-regular text-neutral-10">
                    Mental & emotional support
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 xl:self-end">
              <div className="rounded-2xl bg-primary p-5 md:p-6 lg:p-7.5 flex flex-col gap-8 md:gap-10 xl:gap-52.5 text-neutral-10 w-full md:w-[70%] xl:w-full xl:h-[70%]">
                <div className="flex flex-col gap-1.5">
                  <div className="heading-28 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral-10">
                    SDG 5
                  </div>
                  <div className="body-16-semi md:!text-[18px] lg:!text-[18px] xl:!text-[18px] text-neutral-10">
                    Gender Equality
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="body-16-semi text-neutral-10">70%</div>
                  <div className="body-16-regular text-neutral-10">
                    Women & girls empowered
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 flex flex-col gap-8 md:gap-10 lg:gap-12">
              <div className="rounded-2xl bg-secondary-1 p-5 md:p-6 lg:p-7.5 flex flex-col gap-8 md:gap-10 xl:gap-50.75 text-neutral-10 w-full md:w-[100%] xl:w-full">
                <div className="flex flex-col gap-1.5">
                  <div className="heading-28 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral">
                    SDG 16
                  </div>
                  <div className="body-16-semi md:!text-[18px] lg:!text-[18px] xl:!text-[18px] text-neutral">
                    Peace, Justice and Strong Institutions
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="body-16-semi text-neutral">100%</div>
                  <div className="body-16-regular text-neutral">
                    Safer, transparent communities
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 items-end text-right md:ml-auto md:max-w-[80%] xl:max-w-none">
                <div>
                  <LongDashLineIcon />
                </div>
                <div className="text-[20px] md:!text-[24px] lg:!text-[24px] xl:!text-[24px] font-spectral font-semibold text-neutral-9">
                  Early in our journey, we work to
                </div>
                <div className="body-16-regular italic text-neutral-9 flex flex-col">
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
