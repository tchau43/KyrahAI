import { GoToIcon } from '../icons';

interface ResourceCardProps {
  title: string;
  description: string;
  isFirst?: boolean;
}

export default function ResourceCard({
  title,
  description,
  isFirst = false,
}: ResourceCardProps) {
  return (
    <div
      className={`col-span-3 ${isFirst ? 'col-start-1' : ''} bg-[#FFFCF733] rounded-2xl p-8 relative`}
    >
      <div className="flex flex-col gap-2.5">
        <div className="heading-28 text-neutral">{title}</div>
        <div className="font-inter leading-[1.6] text-neutral">
          {description}
        </div>
        <div className="absolute top-5 right-5">
          <GoToIcon />
        </div>
      </div>
    </div>
  );
}
