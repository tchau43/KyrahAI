'use client';

import { Resource } from '@/types/risk-assessment';
import { GoToIcon } from '../icons';

interface ResourceCardProps {
  resource: Resource;
  isFirst?: boolean;
  onCardClick?: (resourceId: string) => void;
}

export default function ResourceCard({
  resource,
  isFirst = false,
  onCardClick
}: ResourceCardProps) {
  if (!resource) {
    console.warn('ResourceCard: received undefined resource');
    return null;
  }

  const { title, content = '', source_url, resource_id, risk_band } = resource;

  if (!title || !resource_id) {
    console.warn('ResourceCard: resource missing required fields', resource);
    return null;
  }

  const handleClick = () => {
    onCardClick?.(resource_id);

    if (source_url) {
      window.open(source_url, '_blank', 'noopener noreferrer');
    }
  };

  // Determine if button should be clickable
  const isClickable = !!source_url;

  // Get border color based on risk_band
  const getBorderColor = () => {
    switch (risk_band) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-blue-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  return (
    <button
      className={`w-full xl:col-span-3 ${isFirst ? 'xl:col-start-1' : ''} bg-[#FFFCF733] rounded-2xl p-8 relative text-left ${getBorderColor()} ${isClickable ? 'cursor-pointer hover:bg-[#FFFCF766] transition-colors' : 'cursor-default'
        }`}
      onClick={handleClick}
      disabled={!isClickable}
      aria-label={isClickable ? `Open ${title} in new tab` : title}
    >
      <div className="flex flex-col gap-2.5">
        {/* Title */}
        <div className="font-spectral font-semibold text-[1.25rem] leading-[1.1] tracking-[-0.02rem] md:text-[1.5rem] xl:text-[1.75rem] xl:tracking-[-0.04rem] text-neutral-9 pr-8">
          {title}
        </div>

        {/* Description */}
        <div className="font-inter leading-[1.6] text-neutral-9">
          {content}
        </div>

        {/* Go To Icon */}
        {isClickable && (
          <div className="absolute top-5 right-5">
            <GoToIcon />
          </div>
        )}
      </div>
    </button>
  );
}

// Resource List Component
interface ResourceListProps {
  resources: Resource[];
  riskLevel?: string;
  onResourceClick?: (resourceId: string) => void;
}

export function ResourceList({
  resources,
  onResourceClick
}: ResourceListProps) {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className="my-6 w-full">
      <div className="grid grid-cols-1 gap-4">
        {resources.map((resource, index) => (
          <ResourceCard
            key={resource.resource_id}
            resource={resource}
            isFirst={index === 0}
            onCardClick={onResourceClick}
          />
        ))}
      </div>
    </div>
  );
}