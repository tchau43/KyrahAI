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
    <footer className="col-span-12 w-full bg-neutral-9 px-60 md:px-80 py-10">
      <div className="grid grid-cols-12">
        {/* Left Column - Brand and Info */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-inder text-[2.625rem] font-normal text-neutral leading-none">
              KYRAH.AI
            </h2>
            <p className="subtitle-20-medium text-neutral">
              Your quiet ally in emotional awareness
            </p>
          </div>

          <div className="flex flex-col gap-16">
            <p className="body-16-regular text-neutral max-w-lg">
              Kyrah.ai is developed and managed by DNC Technologies LLC, an
              innovation-driven company committed to building ethical AI
              solutions.
            </p>

            {/* Contact */}
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <EmailIcon />
                <span className="body-16-regular text-neutral">
                  Ask@Kyrah.AI
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

        {/* Right Column - Newsletter and Links */}
        <div className="col-span-4 col-start-6 self-end relative">
          {/* Newsletter Signup */}
          <div className="flex flex-col gap-7">
            <div>
              <p className="body-16-regular text-neutral">
                Get updates, resources, and safety tips—
              </p>
              <p className="body-16-regular text-neutral">
                delivered with care.
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
                <button className="absolute -right-15 -top-0.5 p-3 bg-neutral-9 border-white border rounded-full hover:bg-neutral-2 transition-colors cursor-pointer">
                  <TurnRightIcon />
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

        {/* Navigation Links - Right aligned */}
        <div className="col-span-2 col-start-12">
          <nav className="flex flex-col gap-3.5 items-start">
            <Link
              href="/about"
              className="body-18-regular text-neutral hover:opacity-80 transition-opacity"
            >
              About
            </Link>
            <Link
              href="/safety-tips"
              className="body-18-regular text-neutral hover:opacity-80 transition-opacity"
            >
              Safety Tips
            </Link>
            <Link
              href="/resource"
              className="body-18-regular text-neutral hover:opacity-80 transition-opacity"
            >
              Resources
            </Link>
            <Link
              onClick={e => e.preventDefault()}
              href="/blog"
              className="body-18-regular text-neutral transition-opacity cursor-not-allowed"
            >
              Blog
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-16 pt-8 border-t border-neutral-6 w-4/5 mx-auto">
        <div className="flex flex-col gap-2 items-center">
          <p className="caption-14-regular text-neutral opacity-80">
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
