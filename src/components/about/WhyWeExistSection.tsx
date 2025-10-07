import Image from 'next/image';

export default function WhyWeExistSection() {
  return (
    <section className="col-span-12 w-full bg-neutral pt-6 sm:pt-8 md:pt-10 flex justify-center">
      <div className="w-full sm:w-[87.5%] xl:w-[80%] max-w-21xl px-4 sm:px-0">
        <div className="grid grid-cols-12">
          <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6 col-span-12 sm:col-start-2 sm:col-end-12 md:col-start-2 md:col-end-12">
            <div className="text-3xl sm:text-4xl md:heading-54 text-neutral-9 font-spectral font-semibold text-center">
              Why We Exist
            </div>
            <div className="flex flex-col gap-3 items-center text-center px-2 sm:px-4">
              <div className="body-18-regular text-neutral-9 text-sm sm:text-base md:text-lg">
                Every day, silent cries for help are overlooked. Signs of fear,
                manipulation, or despair often go unnoticed until it&apos;s too
                late. Research shows that women and girls are disproportionately
                affected, with 1 in 3 facing violence in their lifetime. Reports
                from the UN, WHO, and UNICEF confirm: the earliest warnings of
                abuse are the most crucial to recognize — yet the easiest to
                miss.
              </div>
              <div className="body-18-regular text-neutral-9 leading-1.5 text-sm sm:text-base md:text-lg">
                <span className="text-neutral-9 font-spectral font-bold text-xl sm:text-2xl">
                  <i>Kyrah.ai</i>
                </span>{' '}
                was created to change that.
              </div>
            </div>
          </div>
          <div className="mt-6 mb-10 sm:mb-14 md:mb-20 flex justify-center col-span-12 sm:col-start-2 sm:col-end-12 md:col-start-2 md:col-end-12">
            <div className="w-full h-[400px] sm:h-[500px] md:h-[658.51px] relative">
              <Image
                src="/clumsy.svg"
                alt="Illustration depicting signs of emotional distress"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
