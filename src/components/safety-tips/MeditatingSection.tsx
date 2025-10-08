import Image from 'next/image';
import { CloseQuoteIcon, OpenQuoteIcon } from '../icons';

export default function MeditatingSection() {
  return (
    <section className="col-span-12 w-full bg-neutral flex justify-center">
      <div className="w-full md:w-[87.5%] xl:w-[80%] max-w-21xl px-4 md:px-0">
        <div className="pt-16 md:pt-28 lg:pt-40 h-max grid grid-cols-12">
          {/* Quote Box */}
          <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3 bg-secondary-3 rounded-xl md:rounded-2xl px-8 md:px-12 lg:px-16 py-6 md:py-7 mb-8 md:mb-10 relative">
            <div className="absolute top-2 left-2 md:top-3 md:left-3 transform -translate-y-1/2 -translate-x-1/2">
              <OpenQuoteIcon />
            </div>
            <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 transform translate-y-1/2 translate-x-1/2">
              <CloseQuoteIcon />
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl xl:text-[2.5rem] xl:leading-[120%] xl:tracking-[-0.06em] italic text-center font-spectral font-medium text-neutral-10">
              You are not alone — your safety matters, and you are deeply
              valued.
            </div>
          </div>

          {/* Image */}
          <div className="relative col-span-12 md:col-start-2 md:col-span-10 w-full h-[300px] md:h-[500px] lg:h-[650px] xl:h-[750px] mb-16 md:mb-28 lg:mb-40">
            <Image
              src="/meditating.svg"
              fill
              alt="meditating"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
