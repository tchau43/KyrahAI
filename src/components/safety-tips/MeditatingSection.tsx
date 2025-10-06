import Image from 'next/image';
import { CloseQuoteIcon, OpenQuoteIcon } from '../icons';

export default function MeditatingSection() {
  return (
    <section className="col-span-12 w-full bg-neutral">
      <div className="pt-40 px-88 h-max grid grid-cols-12">
        <div className="col-span-8 col-start-3 bg-secondary-3 rounded-2xl px-16 py-7  mb-10 relative">
          <div className="absolute top-3 left-3 transform -translate-y-1/2 -translate-x-1/2">
            <OpenQuoteIcon />
          </div>
          <div className="absolute bottom-2 right-2 transform translate-y-1/2 translate-x-1/2">
            <CloseQuoteIcon />
          </div>
          <div className="heading-40 italic text-center !tracking-tighter">
            You are not alone — your safety matters, and you are deeply valued.
          </div>
        </div>
        <div className="relative col-start-2 col-span-10 w-full h-[750px] mb-40">
          <Image
            src="/meditating.svg"
            fill
            alt="meditating"
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}
