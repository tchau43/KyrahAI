'use client';

import { useState } from 'react';
import BlogCard from '../cards/BlogCard';
import { LeftIcon, RightIcon } from '../icons';

const blogData = [
  {
    imageSrc: '/blog-1.jpg',
    category: 'Therapy',
    title: 'How To Change Your Behaviors & Thoughts',
    description:
      "Do you feel that you are able to change ingrained patterns of behavior that you have had for a long time? If not, you're not alone! Most people find it challenging to make lasting behavioral changes.",
  },
  {
    imageSrc: '/blog-2.jpg',
    category: 'Therapy',
    title: 'Leaning into Recovery from Codependency',
    description:
      'Recovery from codependency can be a challenging process that requires ongoing maintenance. You can learn how to conquer codependency in just a few steps.',
  },
  {
    imageSrc: '/blog-3.jpg',
    category: 'Therapy',
    title: 'Is Anyone Listening?',
    description:
      "Dissociation is one of the mind's ways of protecting itself, allowing you to relieve a traumatic experience without being fully present.",
  },
];

export default function BlogSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Create infinite loop by duplicating blog data
  const infiniteBlogs = [...blogData, ...blogData, ...blogData];

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => prevIndex - 1);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);

    // Reset to equivalent position in the middle set for seamless infinite scroll
    if (currentIndex >= blogData.length * 2) {
      setCurrentIndex(currentIndex - blogData.length);
    } else if (currentIndex < 0) {
      setCurrentIndex(currentIndex + blogData.length);
    }
  };

  return (
    <section className="col-span-12 w-full bg-neutral-1 py-30">
      <div className="w-[87.5%] xl:w-[80%] max-w-21xl mx-auto col-span-12 grid grid-cols-12 gap-8">
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Header */}
          <div className="flex flex-col gap-6 col-start-1 col-span-5 text-neutral-9">
            <div className="body-18-semi">Blog</div>
            <div className="heading-54">Voices & Perspectives</div>
          </div>

          {/* Navigation Buttons */}
          <div className="col-span-2 col-start-11 flex gap-4 justify-end self-end">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-neutral-9 flex items-center justify-center hover:bg-neutral-8 transition-colors cursor-pointer"
              aria-label="Previous blog post"
            >
              <LeftIcon />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-neutral-9 flex items-center justify-center hover:bg-neutral-8 transition-colors cursor-pointer"
              aria-label="Next blog post"
            >
              <RightIcon />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="col-span-12">
          <div className="mt-16 overflow-hidden relative">
            <div className="absolute z-10 right-0 bottom-0 w-[50px] h-full bg-gradient-to-r from-transparent to-neutral-1"></div>
            <div
              className={`flex gap-8 ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
              style={{
                transform: `translateX(calc(-${currentIndex} * (100% / 3 + 2rem)))`,
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {infiniteBlogs.map((blog, index) => (
                <div key={index} className="w-1/3 flex-shrink-0">
                  <BlogCard
                    imageSrc={blog.imageSrc}
                    category={blog.category}
                    title={blog.title}
                    description={blog.description}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
