'use client';

import { GoToIcon } from '../icons';

interface ResourceCardProps {
  title: string;
  description: string;
  isFirst?: boolean;
  link?: string;
}

export default function ResourceCard({
  title,
  description,
  isFirst = false,
  link = '#',
}: ResourceCardProps) {
  const handleClick = () => {
    if (link && link !== '#') {
      window.open(link, '_blank', 'noopener noreferrer');
    }
  };

  return (
    <button
      className={`w-full xl:col-span-3 ${isFirst ? 'xl:col-start-1' : ''} bg-[#FFFCF733] rounded-2xl p-8 relative cursor-pointer text-left`}
      onClick={handleClick}
      disabled={link === '#'}
      aria-label={`Open ${title} in new tab`}
    >
      <div className="flex flex-col gap-2.5">
        <div className="font-spectral font-semibold text-[1.25rem] leading-[1.1] tracking-[-0.02rem] md:text-[1.5rem] xl:text-[1.75rem] xl:tracking-[-0.04rem] text-neutral">{title}</div>
        <div className="font-inter leading-[1.6] text-neutral">
          {description}
        </div>
        <div className="absolute top-5 right-5">
          <GoToIcon />
        </div>
      </div>
    </button>
  );
}