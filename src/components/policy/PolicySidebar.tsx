'use client';

import { useState, useEffect } from 'react';
import { PolicyProps } from '@/features/policy/types';

interface PolicySidebarProps {
  policies: PolicyProps[];
}

export default function PolicySidebar({ policies }: PolicySidebarProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (id: string) => {
    setActiveId(id);
  };

  return (
    <div className="xl:pl-8">
      <div className="sticky top-8 space-y-2 rounded-2xl bg-neutral-1 p-6 shadow-sm xl:w-[280px] w-[50%]">
        {policies.map((policy: PolicyProps) => (
          <a
            key={policy.id}
            href={`#${policy.id}`}
            onClick={() => handleClick(policy.id)}
            className={`block py-2 body-18-regular text-neutral-9 transition-all hover:!font-semibold truncate ${
              mounted && activeId === policy.id ? '!font-semibold' : ''
            }`}
            suppressHydrationWarning
          >
            {policy.policyName}
          </a>
        ))}
      </div>
    </div>
  );
}
