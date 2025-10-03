import Image from 'next/image';

export default function Introduce() {
  return (
    <section className="col-span-12 w-full md:px-80 px-60 bg-secondary-1 pt-40">
      <div className="pt-6">
        <div className="flex flex-col gap-4 items-center">
          <div className="body-18-semi text-secondary-2">About us</div>
          <div className="heading-54 text-neutral text-center px-18">
            Empowering Safer Digital Conversations with Care and Innovation
          </div>
          <div className="pt-2 w-full h-[800px] relative">
            <Image
              src="/hero-2.jpg"
              alt="About us"
              fill
              className="object-cover rounded-t-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
