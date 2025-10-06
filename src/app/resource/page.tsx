'use client';
import { Input } from '@heroui/react';
import { SearchIcon } from '@/components/icons';
import { useState, useCallback, useMemo } from 'react';
import { resources } from '@/features/resources/data';
import { Resources } from '@/features/resources/types';
import Link from 'next/link';

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const filteredResources = useMemo(() => {
    if (!searchQuery) return resources;

    return resources.filter(
      resource =>
        resource.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.hotlines.some(
          hotline =>
            hotline.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotline.contact.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [searchQuery]);

  const renderResourceItem = (resource: Resources) => (
    <div
      key={resource.id}
      className="grid grid-cols-12 gap-6 mb-16 col-span-12 w-full"
    >
      <div className="col-span-4">
        <h2 className="heading-40">{resource.country}</h2>
      </div>
      <div className="col-span-9 col-start-5">
        <ul className="space-y-4">
          {resource.hotlines.map((hotline, index) =>
            resource.country === 'Coming soon' ? (
              <li key={index}>
                <div className="flex items-center gap-2">
                  <div className="body-18-semi">
                    {hotline.label}:{' '}
                    <span className="body-18-regular">{hotline.contact}</span>
                  </div>
                </div>
              </li>
            ) : (
              <li className="list-disc" key={index}>
                <div className="flex items-center gap-2">
                  <div className="body-18-semi">
                    {hotline?.link ? (
                      <Link
                        href={hotline.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {hotline.label}:
                      </Link>
                    ) : (
                      <span>{hotline.label}:</span>
                    )}
                  </div>
                  <div className="body-18-regular">{hotline.contact}</div>
                </div>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="font-spectral min-h-screen grid grid-cols-12">
      {/* Header Section */}
      <div className="pt-40 pb-10 text-center col-span-12">
        <div className="body-18-semi text-secondary-1 mb-4">
          Resources & Hotlines
        </div>
        <div className="heading-54 text-neutral-10 max-w-5xl mx-auto">
          These hotlines and resources provide 24/7 confidential support
        </div>
      </div>

      {/* Search Section */}
      <div className="flex justify-center pb-16 col-span-12">
        <div className="w-full max-w-xl">
          <Input
            classNames={{
              inputWrapper:
                'rounded-full border-1 border-neutral-4 body-16-regular py-[1rem] data-[hover=true]:border-neutral-4 group-data-[focus=true]:border-neutral-4',
              input: 'ml-[0.625rem]',
            }}
            startContent={<SearchIcon />}
            variant="bordered"
            placeholder="Search for your local emergency number"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Resources Section */}
      <div className="py-30 col-span-12 w-full border-t border-neutral-1">
        {filteredResources.length > 0 ? (
          filteredResources.map(renderResourceItem)
        ) : (
          <div className="text-center py-20">
            <div className="body-18-regular text-neutral-7">
              No resources found matching your search.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
