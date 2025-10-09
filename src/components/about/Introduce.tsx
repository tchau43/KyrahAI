import Image from 'next/image';

export default function Introduce() {
  return (
    <section className="col-span-12 w-full bg-secondary-1 pt-20 md:!pt-28 lg:!pt-40 flex justify-center">
      <div className="w-full md:!w-[87.5%] xl:!w-[80%] max-w-21xl px-4 md:!px-0">
        <div className="pt-6">
          <div className="flex flex-col gap-3 md:!gap-4 items-center">
            <div className="body-18-semi text-secondary-2">About us</div>
            <div className="heading-32 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral text-center max-w-5xl">
              Empowering Safer Digital Conversations with Care and Innovation
            </div>
            <div className="pt-2 w-full h-[300px] md:!h-[500px] lg:!h-[650px] xl:!h-[800px] relative">
              <Image
                src="/hero-2.jpg"
                alt="About us"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 85vw, 80vw"
                className="object-cover rounded-t-2xl md:!rounded-t-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
