'use client';

import Image from 'next/image';
import { CheckIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';

export default function MissionSection() {
  const router = useRouter();

  return (
    <section className="px-60 md:px-80 col-span-12 w-full bg-neutral relative pb-40">
      <div className="flex flex-col gap-8">
        <div className="body-18-semi text-neutral-9">
          Care shouldn&apos;t be a battle
        </div>
        <div className="flex-col gap-8 grid grid-cols-12">
          <div className="col-span-8 heading-54 text-neutral-9 pb-4">
            Our mission is to make care simple, safe, and human.
          </div>
          <div className="col-span-6 col-start-1 subtitle-20-regular text-neutral-9">
            Kyrah.ai exists to confront one of the world&apos;s most hidden and
            urgent crises: the often overlooked early signs of emotional abuse,
            manipulation, and violence.
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 mt-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-5 subtitle-20-regular text-neutral-9">
            By combining AI with insights from psychology and global safety
            research, we&apos;re creating tools that make a real difference:
          </div>
        </div>
        <div className="subtitle-20-regular text-neutral-9">
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-3.5">
              <CheckIcon />
              Harness AI with psychological and safety insights.
            </li>
            <li className="flex items-center gap-3.5">
              <CheckIcon />
              Builds tools that support people, especially women and vulnerable
              groups.
            </li>
            <li className="flex items-center gap-3.5">
              <CheckIcon />
              Detect red flags early, before risks escalate.
            </li>
            <li className="flex items-center gap-3.5">
              <CheckIcon />
              Encourages clear responses and provides access to trusted support.
            </li>
          </ul>
        </div>
        <button
          className="body-18-semi w-max rounded-full border border-neutral-9 px-28 py-3.5 mt-5 cursor-pointer"
          onClick={() => {
            router.push('/about');
          }}
        >
          View more
        </button>
      </div>
      <div className="absolute right-50 bottom-40 w-[569px] h-[559px]">
        <div className="relative w-full h-full">
          <Image
            src="/plant.svg"
            alt="Plant"
            fill
            className="object-cover object-left"
          />
        </div>
      </div>
    </section>
  );
}
