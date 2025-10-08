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
      className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8 md:mb-12 lg:mb-16 col-span-12 w-full"
    >
      <div className="lg:col-span-4">
        <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] lg:leading-[120%] lg:tracking-[-0.06em] font-spectral font-medium text-neutral-9">
          {resource.country}
        </h2>
      </div>
      <div className="lg:col-span-9 lg:col-start-5">
        <ul className="space-y-3 md:space-y-4">
          {resource.hotlines.map((hotline, index) =>
            resource.country === 'Coming soon' ? (
              <li key={index}>
                <div className="flex items-center gap-2">
                  <div className="text-base md:text-lg lg:text-[1.125rem] lg:leading-[130%] font-inter font-semibold text-neutral-9">
                    {hotline.label}:{' '}
                    <span className="font-normal lg:text-[1.125rem] lg:leading-[140%]">
                      {hotline.contact}
                    </span>
                  </div>
                </div>
              </li>
            ) : (
              <li
                className={`list-disc ml-4 md:ml-5 ${hotline?.link ? 'text-secondary-2' : 'text-neutral-9'}`}
                key={index}
              >
                <div className="text-base md:text-lg lg:text-[1.125rem] lg:leading-[140%] font-inter text-neutral-9">
                  <span className="font-semibold lg:text-[1.125rem] lg:leading-[130%] font-inter">
                    {hotline?.link ? (
                      <Link
                        href={hotline.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-secondary-2 transition-colors"
                      >
                        {hotline.label}:
                      </Link>
                    ) : (
                      <span>{hotline.label}:</span>
                    )}
                  </span>{' '}
                  {hotline.contact}
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
      <div className="pt-20 md:pt-32 lg:pt-40 pb-8 md:pb-10 text-center col-span-12 px-4">
        <div className="w-full md:w-[87.5%] xl:w-[80%] max-w-21xl mx-auto">
          <div className="text-sm md:body-18-semi lg:body-18-semi text-secondary-1 mb-3 md:mb-4">
            Resources & Hotlines
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-[3.375rem] xl:leading-[110%] xl:tracking-[-0.06em] text-neutral-10 max-w-[45rem] mx-auto font-spectral font-semibold">
            These hotlines and resources provide 24/7 confidential support
          </h1>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex justify-center pb-10 md:pb-12 lg:pb-16 col-span-12 px-4">
        <div className="w-full max-w-[34.25rem]">
          <Input
            classNames={{
              inputWrapper:
                'rounded-full border-1 border-neutral-4 bg-neutral-1 h-[3.25rem] data-[hover=true]:border-neutral-4 group-data-[focus=true]:border-neutral-4',
              input:
                'text-sm md:body-16-regular lg:body-16-regular text-neutral-9 font-inter',
              innerWrapper: 'gap-4',
            }}
            startContent={<SearchIcon className="w-5 h-5 flex-shrink-0" />}
            variant="bordered"
            placeholder="Search for your local emergency number"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Resources Section */}
      <div className="py-12 md:py-20 lg:py-30 col-span-12 w-full border-t border-neutral-1 flex justify-center">
        <div className="w-full md:w-[87.5%] xl:w-[80%] max-w-21xl px-4 md:px-0">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-12">
              {filteredResources.map(renderResourceItem)}
            </div>
          ) : (
            <div className="text-center py-12 md:py-16 lg:py-20">
              <div className="text-base md:body-18-regular lg:body-18-regular text-neutral-9 font-inter">
                No resources found matching your search.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
