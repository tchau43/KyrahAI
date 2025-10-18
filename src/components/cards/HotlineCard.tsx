'use client';

import { Resource } from '@/types/risk-assessment';
import { useState } from 'react';

interface ResourceCardProps {
  resource: Resource;
  onCardClick?: (resourceId: string) => void;
}

export default function HotlineCard({
  resource,
  onCardClick
}: ResourceCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!resource) {
    console.warn('ResourceCard: received undefined resource');
    return null;
  }

  const { title, publisher, source_url, resource_id } = resource;

  if (!title || !resource_id) {
    console.warn('ResourceCard: resource missing required fields', resource);
    return null;
  }

  const handleClick = () => {
    onCardClick?.(resource_id);
    if (source_url) {
      const win = window.open(source_url, '_blank', 'noopener,noreferrer');
      if (win) win.opener = null;
    }
  };

  const isClickable = !!source_url;

  return (
    <div className="relative flex-1 min-w-0">
      <button
        type="button"
        className={`w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg border border-secondary-3 bg-neutral hover:bg-neutral-1 transition-colors text-left ${isClickable ? 'cursor-pointer' : 'cursor-default'
          }`}
        onClick={handleClick}
        disabled={!isClickable}
        aria-label={title}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Title - Single line with ellipsis */}
        <div className="caption-14-semi text-neutral-9 truncate w-full">
          {title}
        </div>

        {/* Publisher */}
        {publisher && (
          <div className="caption-14-regular text-neutral-6 truncate w-full">
            {publisher}
          </div>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && title.length > 20 && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-full min-w-[200px] max-w-[300px] px-3 py-2 bg-neutral-9 text-white text-xs rounded-lg shadow-lg">
          <div className="break-words">{title}</div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-4 -mt-1 w-2 h-2 bg-neutral-9 transform rotate-45" />
        </div>
      )}
    </div>
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
    <div className="my-4 w-full">
      <div className="flex gap-2 w-full">
        {resources.map((resource) => (
          <HotlineCard
            key={resource.resource_id}
            resource={resource}
            onCardClick={onResourceClick}
          />
        ))}
      </div>
    </div>
  );
}