import InstaCard from '../cards/InstaCard';
import { CheckIcon } from '../icons';

export default function HelpingSection() {
  return (
    <section className="col-span-12 w-full bg-primary pt-16 md:pt-20 lg:pt-30 rounded-t-2xl md:rounded-t-3xl pb-16 md:pb-24 lg:!pb-24 xl:!pb-[8.5rem] flex justify-center overflow-hidden relative z-3 -mt-4 md:-mt-5 lg:-mt-5 xl:-mt-6">
      <div className="w-full md:w-[87.5%] xl:w-[80%] max-w-21xl px-4 md:px-0">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          <div className="xl:col-span-7">
            <div className="py-4 md:py-5 lg:py-6 flex flex-col gap-8 md:gap-12 lg:gap-16">
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
                <div className="body-16-semi text-neutral-9">
                  With the help of AI, psychology, and global safety research
                </div>
                <div className="heading-28 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral-9">
                  We work to close the gap between what is often invisible and
                  what urgently needs attention.
                </div>
              </div>
              <div className="bg-[#FFFCF766] rounded-xl md:rounded-2xl flex flex-col gap-2 md:gap-2.5 justify-between items-start px-6 md:px-12 lg:pl-20 body-18-regular text-neutral-9 py-5 md:py-[1.375rem] lg:py-6">
                <div className="flex items-start md:items-center gap-2 md:gap-3">
                  <div className="mt-1 md:mt-0 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <div className="body-16-regular md:!text-[18px] lg:!text-[18px] xl:!text-[18px]">
                    <span className="font-semibold">
                      Detects early red flags
                    </span>{' '}
                    that are easy to miss
                  </div>
                </div>
                <div className="flex items-start md:items-center gap-2 md:gap-3">
                  <div className="mt-1 md:mt-0 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <div className="body-16-regular md:!text-[18px] lg:!text-[18px] xl:!text-[18px]">
                    <span className="font-semibold">
                      Provides clear guidance
                    </span>{' '}
                    in moments of uncertainty
                  </div>
                </div>
                <div className="flex items-start md:items-center gap-2 md:gap-3">
                  <div className="mt-1 md:mt-0 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <div className="body-16-regular md:!text-[18px] lg:!text-[18px] xl:!text-[18px]">
                    <span className="font-semibold">Connects people</span> to
                    trusted resources for safety and support
                  </div>
                </div>
                <div className="flex items-start md:items-center gap-2 md:gap-3">
                  <div className="mt-1 md:mt-0 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <div className="body-16-regular md:!text-[18px] lg:!text-[18px] xl:!text-[18px]">
                    <span className="font-semibold">
                      Empowers vulnerable groups
                    </span>{' '}
                    to act before harm escalates
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-5 flex justify-center xl:justify-end px-6 md:px-0 py-8 md:py-0 xl:px-8">
            <InstaCard />
          </div>
        </div>
      </div>
    </section>
  );
}
