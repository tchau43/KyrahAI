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
      className={`w-full xl:col-span-4 ${isFirst ? 'xl:col-start-1' : ''} ${backgroundColor} p-4 xl:p-8 rounded-2xl mt-4 xl:mt-10`}
    >
      <div className="flex flex-col md:flex-row xl:flex-col gap-6 md:h-[250px] xl:h-full">
        {/* Text content */}
        <div className="flex flex-col gap-6 md:flex-1 xl:flex-none">
          <div className="heading-28-semi md:!text-[2rem] xl:!text-[2.5rem] xl:!font-medium xl:!tracking-[-0.06rem] text-neutral-9">
            <i>{step}/</i> {title}
          </div>
          <div className="body-16-regular text-neutral-9">
            {description}
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full md:w-[40%] xl:w-full h-[200px] md:top-16 xl:top-0">
          <Image src={imageSrc} fill alt={imageAlt} className="object-contain" />
        </div>
      </div>
    </div>
  );
}
