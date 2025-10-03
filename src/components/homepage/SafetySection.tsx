import Image from 'next/image';

export default function SafetySection() {
  return (
    <section className="col-span-12 w-full grid grid-cols-12 gap-10 bg-neutral z-60 px-60 pt-7.5 pb-60">
      <div className="col-span-6">
        <div className="flex flex-col gap-2.5 mb-20">
          <div className="body-18-semi">Safety tips</div>
          <div>
            <div className="heading-54">Stay Safe,</div>
            <div className="heading-54">Stay in Control</div>
          </div>
        </div>
        <div className="relative h-[300px]">
          <div className="w-full h-[400px] absolute top-0 -left-12">
            <Image src="/reading-side.svg" fill alt="Safety Section" />
          </div>
        </div>
      </div>
      <div className="col-span-6 col-start-7 flex flex-col gap-4">
        <div className="subtitle-20-regular pt-[7.5rem]">
          These quick steps can help you stay aware and protect yourself in
          everyday situations:
        </div>
        <ul className="list-disc subtitle-20-regular pl-5">
          <li>
            <span className="font-bold">Use Quick-Exit:</span> Practice using it
            before you need it.
          </li>
          <li>
            <span className="font-bold">Browse privately:</span> Use incognito
            windows and clear history if needed.
          </li>
          <li>
            <span className="font-bold">Device safety:</span> Turn off
            auto-backup for sensitive screenshots.
          </li>
        </ul>
        <button className="body-18-semi w-max rounded-full border border-neutral-9 px-28 py-3.5 mt-14 cursor-pointer">
          View more
        </button>
      </div>
    </section>
  );
}
