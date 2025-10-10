import Image from 'next/image';

interface HowItWorksCardProps {
  step: string;
  title: string;
  description: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  backgroundColor: string;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function HowItWorksCard({
  step,
  title,
  description,
  imageSrc,
  imageAlt,
  backgroundColor,
  isFirst = false,
  isLast = false,
}: HowItWorksCardProps) {
  return (
    <div className={`w-full xl:col-span-4 ${isFirst ? 'xl:col-start-1' : ''} ${backgroundColor} p-4 xl:p-8 rounded-2xl mt-4 xl:mt-10`}>
      <div className="flex flex-col md:flex-row xl:flex-col gap-6 md:h-[250px] xl:h-full xl:justify-between">
        {/* Text content */}
        <div className="flex flex-col gap-6 md:flex-1 xl:flex-none">
          <div className={`md:pt-4 xl:pt-0 heading-28 md:!text-[2rem] xl:!text-[2.5rem] xl:!tracking-[-0.06rem] ${isLast ? 'text-white' : 'text-neutral-9'}`}>
            <i>{step}/</i> {title}
          </div>
          <div className={`body-16-regular ${isLast ? 'text-white' : 'text-neutral-9'}`}>
            {description}
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full md:w-[40%] xl:w-full h-[200px] xl:h-[300px] md:top-16 xl:top-0 flex items-end justify-center">
          <div className={`relative w-full h-full ${isFirst ? 'w-[60%]' : isLast ? 'w-[80%]' : 'w-[90%]'}`}>
            <Image src={imageSrc} fill alt={imageAlt} className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
