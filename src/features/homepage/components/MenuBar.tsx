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

    return createPortal(
        // Overlay (click outside to close) + Sidebar
        <div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden={!isMenuOpen}
        >
            <div
                className="bg-neutral w-60 md:w-90 h-full px-6 py-10 shadow-lg"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* Content */}
                <div className="flex flex-col justify-between h-full">
                    {/* Above Content */}
                    <div>
                        {/* Menu Button */}
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-md text-neutral-9 hover:text-neutral-7" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <svg
                                    className="size-8"
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
                            <span className="body-16-semi font-inter text-neutral-9">Menu</span>
                        </div>
                        {/* Items */}
                        <div className="flex flex-col gap-4 px-4 py-4">
                            {navigationItems.map((item) => (
                                <div key={item.href} className="relative">
                                    {item.comingSoon && (
                                        <span className="absolute -top-4 left-4 bg-secondary-3 text-xs px-2 rounded-full text-black font-inter caption-14-semi">
                                            Soon
                                        </span>
                                    )}
                                    <Link href={item.href} className={`body-16-semi font-inter text-neutral-9 ${item.comingSoon ? 'text-secondary-2 cursor-not-allowed' : ''}`}>
                                        {item.label}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Items */}
                    <div className="flex flex-col gap-4">
                        <button
                            // onClick={() => openModal('begin-modal')}
                            className="px-8 py-3 col-span-3 bg-neutral-10 text-white rounded-full font-inter body-16-semi hover:bg-neutral-9 transition-colors cursor-pointer"
                        >
                            Chat with Kyrah (Alpha test)
                        </button>
                        <button className="px-8 py-3 col-span-3 bg-transparent border border-neutral-6 text-neutral-10 rounded-full font-inter body-16-semi hover:bg-neutral-1 transition-colors cursor-pointer">
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