import Quote from '../cards/Quote';
import { DashLineIcon } from '../icons';

export default function ActionSection() {
  return (
    <section className="col-span-12 w-full md:px-80 px-60 bg-neutral pt-30 pb-20">
      <div className="flex flex-col gap-30">
        <div className="flex justify-between gap-20">
          <div className="heading-54 text-neutral-9">
            Turning Awareness Into Action
          </div>
          <Quote />
        </div>
        <div className="flex flex-col gap-20">
          <div className="flex gap-12">
            <div className="flex flex-col gap-6 w-full">
              <div>
                <DashLineIcon />
              </div>
              <div className="flex flex-col gap-4">
                <div className="heading-32 text-neutral-9">Human First</div>
                <div className="font-inter font-normal text-lg leading-[1.6] text-neutral-9">
                  AI should amplify human judgment, never replace it.
                </div>
              </div>
              <div className="font-inter font-bold text-sm leading-[1.6] text-neutral-9">
                -Kyrah&apos;s values
              </div>
            </div>
            <div className="flex flex-col gap-6 w-full">
              <div>
                <DashLineIcon />
              </div>
              <div className="flex flex-col gap-4">
                <div className="heading-32 text-neutral-9">
                  Safety by Design
                </div>
                <div className="font-inter font-normal text-lg leading-[1.6] text-neutral-9">
                  Privacy, confidentiality, and empowerment are at the core of
                  every feature.
                </div>
              </div>
              <div className="font-inter font-bold text-sm leading-[1.6] text-neutral-9">
                -Kyrah&apos;s values
              </div>
            </div>
            <div className="flex flex-col gap-6 w-full">
              <div>
                <DashLineIcon />
              </div>
              <div className="flex flex-col gap-4">
                <div className="heading-32 text-neutral-9">Truth to Power</div>
                <div className="font-inter font-normal text-lg leading-[1.6] text-neutral-9">
                  We reveal gaslighting, manipulation, and coercion that silence
                  vulnerable voices.
                </div>
              </div>
              <div className="font-inter font-bold text-sm leading-[1.6] text-neutral-9">
                -Kyrah&apos;s values
              </div>
            </div>
          </div>
          <div className="flex gap-22">
            <div className="flex flex-col gap-6 w-full">
              <div>
                <DashLineIcon />
              </div>
              <div className="flex flex-col gap-4">
                <div className="heading-32 text-neutral-9">
                  Compassion at Scale
                </div>
                <div className="font-inter font-normal text-lg leading-[1.6] text-neutral-9">
                  Every individual matters, and together we&apos;re building to
                  protect millions worldwide.
                </div>
              </div>
              <div className="font-inter font-bold text-sm leading-[1.6] text-neutral-9">
                -Kyrah&apos;s values
              </div>
            </div>
            <div className="flex flex-col gap-6 w-full">
              <div>
                <DashLineIcon />
              </div>
              <div className="flex flex-col gap-4">
                <div className="heading-32 text-neutral-9">
                  Transparency and Trust
                </div>
                <div className="font-inter font-normal text-lg leading-[1.6] text-neutral-9">
                  Guided by global research, our methods are designed to be
                  explainable and accountable.
                </div>
              </div>
              <div className="font-inter font-bold text-sm leading-[1.6] text-neutral-9">
                -Kyrah&apos;s values
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
