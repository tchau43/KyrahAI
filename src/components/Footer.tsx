'use client';

import Link from 'next/link';
import {
  EmailIcon,
  LinkedinIcon,
  TwitterIcon,
  FacebookIcon,
  TurnRightIcon,
  EmailColoredIcon,
} from './icons';
import { Input } from '@heroui/react';

export default function Footer() {
  return (
    <footer className="col-span-12 mx-auto w-full bg-neutral-9 py-14">
      <div className="w-[87.5%] xl:w-[80%] 2xl:w-[70%] max-w-7xl mx-auto col-span-12 md:grid md:grid-cols-12 flex flex-col">

        {/* INFORMATION */}
        <div className="md:col-span-7 xl:col-span-4 flex flex-col gap-6 mt-20 md:mt-0 pt-10 md:pt-0 border-t border-neutral-6 md:border-none">
          {/* BRAND */}
          <div className="flex flex-col gap-4 pb-10">
            <h2 className="font-inder text-[1.75rem] md:text-[2.625rem] font-normal text-neutral leading-none">
              KYRAH.AI
            </h2>
            <p className="body-16-semi md:!text-[1.25rem] md:!font-medium  text-neutral">
              Your quiet ally in emotional awareness
            </p>
            <p className="body-14-regular md:!text-[1rem] text-neutral max-w-lg">
              Kyrah.ai is developed and managed by DNC Technologies LLC, an
              innovation-driven company committed to building ethical AI
              solutions.
            </p>
          </div>

          {/* CONTACT */}
          <div className="top-10 xl:hidden">
            {/* Newsletter Signup */}
            <div className="flex flex-col gap-7">
              <div>
                <p className="body-14-regular md:!text-[1rem] text-neutral">
                  Get updates, resources, and safety tips — delivered with care.
                </p>
              </div>

              <div className="flex gap-2 w-full space-between">
                <div className="flex gap-8 w-full">
                  <Input
                    aria-label="Your email"
                    placeholder="Your email"
                    startContent={
                      <EmailColoredIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />
                    }
                    classNames={{
                      input: 'placeholder:text-neutral-5 font-inter',
                    }}
                    type="email"
                  />
                  <button className="group p-3 bg-neutral-9 border-white border rounded-full hover:bg-neutral-2 transition-colors cursor-pointer" aria-label="Subscribe to the newsletter">
                    <TurnRightIcon fill="currentColor" className="text-white group-hover:text-neutral-9 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-16">
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <EmailIcon />
                <span className="body-16-regular text-neutral">
                  safe@kyrah.ai
                </span>
              </div>
              <div className="flex gap-7">
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  <LinkedinIcon />
                </Link>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  <TwitterIcon />
                </Link>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  <FacebookIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - XL - Newsletter and Links */}
        <div className="hidden xl:block col-span-4 col-start-6 self-end relative">
          {/* Newsletter Signup */}
          <div className="flex flex-col gap-7">
            <div>
              <p className="body-16-regular text-neutral">
                Get updates, resources, and safety tips — delivered with care.
              </p>
            </div>

            <div className="flex gap-2 w-3/4">
              <div className="flex-1 relative">
                <Input
                  aria-label="Your email"
                  placeholder="Your email"
                  startContent={
                    <EmailColoredIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />
                  }
                  classNames={{
                    input: 'placeholder:text-neutral-5 font-inter',
                  }}
                  type="email"
                />
                <button className="group absolute -right-15 -top-0.5 p-3 bg-neutral-9 border-white border rounded-full hover:bg-neutral-2 transition-colors cursor-pointer" aria-label="Subscribe to the newsletter">
                  <TurnRightIcon fill="currentColor" className="text-white group-hover:text-neutral-9 transition-colors" />
                </button>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex gap-6 justify-end w-3/4">
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="body-16-regular text-neutral hover:opacity-80 transition-opacity underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="body-16-regular text-neutral hover:opacity-80 transition-opacity underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="w-full md:col-span-3 md:col-start-10 xl:col-span-2 xl:col-start-11 order-first md:order-none flex md:flex-col gap-10 justify-between">
          {/* about ... linka */}
          <nav className="flex flex-col gap-3.5 items-start">
            <Link
              href="/about"
              className="body-16-regular text-neutral hover:opacity-80 transition-opacity md:text-[1.125rem]"
            >
              About
            </Link>
            <Link
              href="/how-it-works"
              className="body-16-regular text-neutral hover:opacity-80 transition-opacity md:text-[1.125rem]"
            >
              How It Works
            </Link>
            <Link
              href="/safety-tips"
              className="body-16-regular text-neutral hover:opacity-80 transition-opacity md:text-[1.125rem]"
            >
              Safety Tips
            </Link>
            <Link
              href="/resource"
              className="body-16-regular text-neutral hover:opacity-80 transition-opacity md:text-[1.125rem]"
            >
              Resources
            </Link>
            <Link
              onClick={e => e.preventDefault()}
              href="/blog"
              className="body-16-regular text-neutral transition-opacity cursor-not-allowed md:text-[1.125rem]"
            >
              Blog
            </Link>
          </nav>
          {/* policy and terms */}
          <div className="xl:hidden flex flex-col gap-6 items-end md:items-start">
            <Link
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="body-16-regular text-neutral hover:opacity-80 transition-opacity underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="body-16-regular text-neutral hover:opacity-80 transition-opacity underline"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-16 pt-8 border-t border-neutral-6 w-[87.5%] xl:w-[80%] 2xl:w-[70%] mx-auto">
        <div className="flex flex-col gap-2 items-center">
          <p className="caption-14-regular text-neutral opacity-80 text-center">
            Not a medical or emergency service. If in crisis, call 911 or your
            local hotline.
          </p>
          <p className="caption-14-regular text-neutral opacity-60">
            © 2025 KYRAH. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
