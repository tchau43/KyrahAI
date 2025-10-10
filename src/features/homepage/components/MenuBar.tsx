'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

interface MenuBarProps {
    setIsMenuOpen: (isMenuOpen: boolean) => void;
    isMenuOpen: boolean;
}

interface NavItem {
    href: string;
    label: string;
    disabled?: boolean;
    comingSoon?: boolean;
}

const navigationItems: NavItem[] = [
    { href: '/safety-tips', label: 'Safety Tips' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/about', label: 'About' },
    { href: '/resource', label: 'Resource' },
    { href: '/blog', label: 'Blog', disabled: true, comingSoon: true },
];

const MenuBar = ({ setIsMenuOpen, isMenuOpen }: MenuBarProps) => {
    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            const originalBodyOverflow = document.body.style.overflow;
            const originalHtmlOverflow = document.documentElement.style.overflow;
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalBodyOverflow;
                document.documentElement.style.overflow = originalHtmlOverflow;
            };
        }
    }, [isMenuOpen]);

    if (!isMenuOpen && typeof document === 'undefined') return null;

    return createPortal(
        // Overlay (click outside to close) + Sidebar
        <div
            className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => setIsMenuOpen(false)}
        >
            <div
                className={`bg-neutral w-60 md:w-90 h-full px-6 py-10 shadow-lg transition-all duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
            >
                {/* Content */}
                <div className="flex flex-col justify-between h-full">
                    {/* Above Content */}
                    <div>
                        {/* Menu Button */}
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-md text-neutral-9 hover:text-neutral-5 transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <svg
                                    className="size-6"
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
                                <span className="body-16-semi font-inter">Menu</span>
                            </button>
                        </div>
                        {/* Items */}
                        <div className="flex flex-col gap-4 px-4 py-4">
                            {navigationItems.map((item, index) => (
                                <div
                                    key={item.href}
                                    className={`relative transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                                        }`}
                                    style={{
                                        transitionDelay: isMenuOpen ? `${index * 80 + 150}ms` : '0ms'
                                    }}
                                >
                                    {item.comingSoon && (
                                        <span className="absolute -top-4 left-4 bg-secondary-3 text-xs px-2 rounded-full text-black font-inter caption-14-semi">
                                            Soon
                                        </span>
                                    )}
                                    <Link
                                        href={item.href}
                                        className={`body-16-semi font-inter text-neutral-9 transition-colors hover:text-neutral-7 ${item.comingSoon ? 'text-secondary-2 cursor-not-allowed' : ''}`}
                                        onClick={(e) => item.comingSoon ? e.preventDefault() : undefined}
                                    >
                                        {item.label}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Items */}
                    <div
                        className={`flex flex-col gap-4 transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                        style={{
                            transitionDelay: isMenuOpen ? '450ms' : '0ms'
                        }}
                    >
                        <button
                            // onClick={() => openModal('begin-modal')}
                            className="px-8 py-3 col-span-3 bg-neutral-10 text-white rounded-full font-inter body-16-semi hover:bg-neutral-9 transition-all duration-200 hover:scale-102 cursor-pointer"
                        >
                            Chat with Kyrah (Alpha test)
                        </button>
                        <button className="px-8 py-3 col-span-3 bg-transparent border border-neutral-6 text-neutral-10 rounded-full font-inter body-16-semi hover:bg-neutral-1 transition-all duration-200 hover:scale-102 cursor-pointer">
                            Watch Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MenuBar;