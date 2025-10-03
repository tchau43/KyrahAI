import Image from 'next/image';

export default function WhyWeExistSection() {
  return (
    <section className="col-span-12 w-full md:px-80 px-60 bg-neutral pt-10">
      <div className="grid grid-cols-12">
        <div className="flex flex-col items-center gap-6 col-span-12 col-start-2 col-end-12">
          <div className="heading-54 text-neutral-9">Why We Exist</div>
          <div className="flex flex-col gap-3 items-center text-center">
            <div className="body-18-regular text-neutral-9">
              Every day, silent cries for help are overlooked. Signs of fear,
              manipulation, or despair often go unnoticed until it&apos;s too
              late. Research shows that women and girls are disproportionately
              affected, with 1 in 3 facing violence in their lifetime. Reports
              from the UN, WHO, and UNICEF confirm: the earliest warnings of
              abuse are the most crucial to recognize — yet the easiest to miss.
            </div>
            <div className="body-18-regular text-neutral-9 leading-1.5">
              <span className="text-neutral-9 font-spectral font-bold text-2xl">
                <i>Kyrah.ai</i>
              </span>{' '}
              was created to change that.
            </div>
          </div>
        </div>
        <div className="mx-12.5 mt-6 mb-20 flex justify-center col-span-12 col-start-2 col-end-12">
          <div className="w-[830px] h-[658.51px] relative">
            <Image
              src="/clumsy.svg"
              alt="Illustration depicting signs of emotional distress"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
