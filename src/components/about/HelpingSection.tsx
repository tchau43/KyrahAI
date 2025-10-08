import InstaCard from '../cards/InstaCard';
import { CheckIcon } from '../icons';

export default function HelpingSection() {
  return (
    <section className="col-span-12 w-full bg-primary pt-16 md:pt-20 lg:pt-30 rounded-t-2xl md:rounded-t-3xl pb-16 md:pb-24 lg:pb-[8.5rem] flex justify-center overflow-hidden relative z-3 -mt-2 md:-mt-4 lg:-mt-6">
      <div className="w-full md:w-[87.5%] xl:w-[80%] max-w-21xl px-4 md:px-0">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          <div className="xl:col-span-7">
            <div className="py-4 md:py-5 lg:py-6 flex flex-col gap-8 md:gap-12 lg:gap-16">
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
                <div className="body-16-semi text-neutral-9 text-sm md:text-base">
                  With the help of AI, psychology, and global safety research
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl xl:heading-54 text-neutral-9 font-spectral font-semibold">
                  We work to close the gap between what is often invisible and
                  what urgently needs attention.
                </div>
              </div>
              <div className="bg-[#FFFCF766] rounded-xl md:rounded-2xl flex flex-col gap-2 md:gap-2.5 justify-between items-start px-6 md:px-12 lg:pl-20 body-18-regular text-neutral-9 py-5 md:py-5.5 lg:py-6">
                <div className="flex items-start md:items-center gap-2 md:gap-3">
                  <div className="mt-1 md:mt-0 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <div className="text-sm md:text-base lg:text-lg">
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
                  <div className="text-sm md:text-base lg:text-lg">
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
                  <div className="text-sm md:text-base lg:text-lg">
                    <span className="font-semibold">Connects people</span> to
                    trusted resources for safety and support
                  </div>
                </div>
                <div className="flex items-start md:items-center gap-2 md:gap-3">
                  <div className="mt-1 md:mt-0 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <div className="text-sm md:text-base lg:text-lg">
                    <span className="font-semibold">
                      Empowers vulnerable groups
                    </span>{' '}
                    to act before harm escalates
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-5 flex justify-center xl:justify-end px-6 md:px-0 py-8 md:py-0">
            <InstaCard />
          </div>
        </div>
      </div>
    </section>
  );
}
