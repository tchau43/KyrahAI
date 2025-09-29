'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 z-99 left-1/2 transform -translate-x-1/2 w-[66.666667%] mx-auto mt-8
                 backdrop-blur-[30px] bg-[#FFFFFF3D] rounded-full"
    >
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/kyrah-logo.svg"
                alt="Kyrah Logo"
                width={40}
                height={40}
              />
              <span className="text-3xl font-inder text-gray-800 font-normal">
                KYRAH.AI
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/about"
              className="text-neutral-9 font-inter transition-colors body-16-semi"
            >
              About
            </Link>
            <Link
              href="/how-it-works"
              className="text-neutral-9 font-inter transition-colors body-16-semi"
            >
              How It Works
            </Link>
            <Link
              href="/safety-tips"
              className="text-neutral-9 font-inter transition-colors body-16-semi"
            >
              Safety Tips
            </Link>
            <Link
              href="/resource"
              className="text-neutral-9 font-inter transition-colors body-16-semi"
            >
              Resource
            </Link>
            <div className="relative">
              <Link
                href="/blog"
                className="text-secondary-2 font-inter transition-colors body-16-semi cursor-not-allowed"
                onClick={e => e.preventDefault()}
              >
                Blog
              </Link>
              <span className="absolute -top-6 -right-7 bg-secondary-3 text-xs px-2 py-0.5 rounded-full text-black font-inter caption-14-semi">
                Soon
              </span>
            </div>
          </div>

          {/* Safe Exit Button */}
          <div className="flex items-center">
            <Link
              href="/safe-exit"
              className="px-6 py-2 border rounded-full text-neutral-9 body-16-semi hover:bg-gray-50 font-inter text-base transition-colors bold-16-semi"
            >
              Safe Exit
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
