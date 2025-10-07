import Image from 'next/image';

export default function Introduce() {
  return (
    <section className="col-span-12 w-full bg-secondary-1 pt-20 sm:pt-28 md:pt-40 flex justify-center">
      <div className="w-full sm:w-[87.5%] xl:w-[80%] max-w-21xl px-4 sm:px-0">
        <div className="pt-6">
          <div className="flex flex-col gap-3 sm:gap-4 items-center">
            <div className="body-18-semi text-secondary-2">About us</div>
            <div className="heading-54 text-neutral text-center px-4 sm:px-8 md:px-12 lg:px-18">
              Empowering Safer Digital Conversations with Care and Innovation
            </div>
            <div className="pt-2 w-full h-[300px] sm:h-[500px] md:h-[650px] lg:h-[800px] relative">
              <Image
                src="/hero-2.jpg"
                alt="About us"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 85vw, 80vw"
                className="object-cover rounded-t-2xl sm:rounded-t-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
