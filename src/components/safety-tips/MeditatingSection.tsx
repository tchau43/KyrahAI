import Image from 'next/image';

export default function MeditatingSection() {
  return (
    <section className="col-span-12 w-full bg-neutral">
      <div className="pt-40 px-88 h-max grid grid-cols-12">
        <div className="col-span-8 col-start-3 bg-secondary-3 rounded-2xl heading-40 text-center px-16 py-7 !tracking-tighter mb-10">
          You are not alone — your safety matters, and you are deeply valued.
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
