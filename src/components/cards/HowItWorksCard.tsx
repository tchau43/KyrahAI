import Image from 'next/image';

interface HowItWorksCardProps {
  step: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  backgroundColor: string;
  isFirst?: boolean;
}

export default function HowItWorksCard({
  step,
  title,
  description,
  imageSrc,
  imageAlt,
  backgroundColor,
  isFirst = false,
}: HowItWorksCardProps) {
  return (
    <div
      className={`col-span-4 ${isFirst ? 'col-start-1' : ''} ${backgroundColor} p-8 rounded-2xl mt-10`}
    >
      <div className="flex flex-col gap-6 mb-5">
        <div className="heading-40 text-neutral-9">
          <i>{step}/</i> {title}
        </div>
        <div className="font-inter leading-[1.6] text-neutral-9">
          {description}
        </div>
      </div>
      <div className="relative w-full md:h-[400px] h-[250px] ">
        <Image src={imageSrc} fill alt={imageAlt} />
      </div>
    </div>
  );
}
