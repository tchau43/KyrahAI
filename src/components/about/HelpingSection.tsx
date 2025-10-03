import InstaCard from '../cards/InstaCard';
import { CheckIcon } from '../icons';

export default function HelpingSection() {
  return (
    <section className="col-span-12 grid grid-cols-12 gap-6 w-full md:px-80 px-60 bg-primary pt-30 rounded-t-3xl pb-[8.5rem]">
      <div className="col-span-7">
        <div className="py-6 flex flex-col gap-16">
          <div className="flex flex-col gap-6">
            <div className="body-16-semi text-neutral-9">
              With the help of AI, psychology, and global safety research
            </div>
            <div className="heading-54 text-neutral-9">
              We work to close the gap between what is often invisible and what
              urgently needs attention.
            </div>
          </div>
          <div className="bg-[#FFFCF766] rounded-2xl flex flex-col gap-2 justify-between items-start pl-20 body-18-regular text-neutral-9 py-6">
            <div className="flex items-center gap-2">
              <CheckIcon />
              <div>
                <span className="font-semibold">Detects early red flags</span>{' '}
                that are easy to miss
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon />
              <div>
                <span className="font-semibold">Provides clear guidance</span>{' '}
                in moments of uncertainty
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon />
              <div>
                <span className="font-semibold">Connects people</span> to
                trusted resources for safety and support
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon />
              <div>
                <span className="font-semibold">
                  Empowers vulnerable groups
                </span>{' '}
                to act before harm escalates
              </div>
            </div>
          </div>
        </div>
      </div>
      <InstaCard />
    </section>
  );
}
