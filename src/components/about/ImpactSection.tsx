import { LongDashLineIcon } from '../icons';

export default function ImpactSection() {
  return (
    <section className="col-span-12 w-full md:px-80 px-60 bg-neutral-1 py-25">
      <div className="flex flex-col gap-0.5">
        <div className="heading-54">Our Impact</div>
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-4 flex flex-col justify-between">
            <div className="font-inter font-medium text-lg leading-[1.6] pt-5">
              Kyrah.ai is aligned with the United Nations Sustainable
              Development Goals, including:
            </div>
            <div className="rounded-2xl bg-secondary-3 p-7.5 flex flex-col gap-12.5">
              <div className="flex flex-col gap-1.5">
                <div className="display">SDG 3</div>
                <div className="body-18-semi">Good Health & Well-Being</div>
              </div>
              <div className="flex flex-col">
                <div className="font-inter font-bold text-lg leading-[1.3]">
                  24/7
                </div>
                <div className="body-16-regular">
                  Mental & emotional support
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4 rounded-2xl bg-primary p-7.5 flex flex-col gap-52.5 justify-between h-[70%] self-end">
            <div className="flex flex-col gap-1.5">
              <div className="display">SDG 5</div>
              <div className="body-18-semi">Gender Equality</div>
            </div>
            <div className="flex flex-col">
              <div className="font-inter font-bold text-lg leading-[1.3]">
                70%
              </div>
              <div className="body-16-regular">Women & girls empowered</div>
            </div>
          </div>
          <div className="col-span-4 flex flex-col justify-between gap-12">
            <div className="rounded-2xl bg-secondary-1 p-7.5 flex flex-col gap-50.75">
              <div className="flex flex-col gap-1.5">
                <div className="display text-neutral">SDG 16</div>
                <div className="body-18-semi text-neutral">
                  Peace, Justice and Strong Institutions
                </div>
              </div>
              <div className="flex flex-col">
                <div className="font-inter font-bold text-lg leading-[1.3] text-neutral">
                  100%
                </div>
                <div className="body-16-regular text-neutral">
                  Safer, transparent communities
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 items-end text-right">
              <div>
                <LongDashLineIcon />
              </div>
              <div className="font-spectral font-semibold text-2xl">
                Early in our journey, we work to
              </div>
              <div className="font-inter italic font-normal flex flex-col">
                <div>End gender-based violence,</div>
                <div>Support emotional well-being,</div>
                <div>and Build safer communities worldwide.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
