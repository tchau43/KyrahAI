// src/components/emergency/EmergencyHotlineButton.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useEmergencyHotline } from '@/hooks/useEmergencyHotline';
import { EmergencyHotline, formatPhoneNumber } from '@/data/emergency-hotlines';

interface EmergencyHotlineButtonProps {
  position?: 'fixed' | 'relative';
  className?: string;
}

export default function EmergencyHotlineButton({
  position = 'fixed',
  className = '',
}: EmergencyHotlineButtonProps) {
  const {
    countryName,
    hotlines,
    primaryHotline,
    isLoading,
    handleCall,
  } = useEmergencyHotline();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);


  // Close dropdown khi click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close dropdown khi press Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Handle quick call (primary hotline)
  const handleQuickCall = () => {
    if (hotlines.length === 1 && primaryHotline) {
      handleCall(primaryHotline);
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Handle hotline selection
  const handleHotlineSelect = (hotline: EmergencyHotline) => {
    handleCall(hotline);
    setIsOpen(false);
  };

  // Don't render if loading or no hotlines
  if (isLoading || hotlines.length === 0) {
    return null;
  }

  const positionClasses = position === 'fixed'
    ? 'fixed bottom-16 right-4 md:bottom-20 md:right-6 lg:bottom-24 z-50'
    : 'relative';

  return (
    <div className={`${positionClasses} ${className}`}>
      {/* Main Button */}
      <button
        ref={buttonRef}
        onClick={handleQuickCall}
        onKeyDown={(e) => {
          // Open dropdown với Enter/Space (nếu có nhiều hotlines)
          if ((e.key === 'Enter' || e.key === ' ') && hotlines.length > 1) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-label={`Emergency hotline for ${countryName}. Click to call ${primaryHotline?.name || 'emergency services'}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`
          flex items-center gap-2
          px-4 py-3 md:px-5 md:py-3
          bg-red-600 hover:bg-red-700 active:bg-red-800
          text-white
          rounded-full
          shadow-lg hover:shadow-xl
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          font-semibold
          text-sm md:text-base
          min-w-[140px] md:min-w-[160px]
        `}
      >
        {/* Emergency Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>

        <span className="hidden sm:inline">
          {primaryHotline ? primaryHotline.name : 'Emergency'}
        </span>
        <span className="sm:hidden">911</span>

        {/* Dropdown Arrow (nếu có nhiều hotlines) */}
        {hotlines.length > 1 && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && hotlines.length > 1 && (
        <div
          ref={dropdownRef}
          role="menu"
          aria-label="Emergency hotlines"
          className="
            absolute bottom-full right-0 mb-2
            w-72 md:w-80
            bg-white
            rounded-lg
            shadow-2xl
            border border-neutral-3
            overflow-hidden
            animate-in fade-in slide-in-from-bottom-2
          "
        >
          {/* Header */}
          <div className="px-4 py-3 bg-red-50 border-b border-red-100">
            <h3 className="text-sm font-semibold text-neutral-9">
              Emergency Hotlines - {countryName}
            </h3>
            <p className="text-xs text-neutral-6 mt-0.5">
              Select a number to call
            </p>
          </div>

          {/* Hotline List */}
          <div className="max-h-96 overflow-y-auto">
            {hotlines.map((hotline, index) => {
              const isEmergency = hotline.type === 'emergency';
              const isCrisis = hotline.type === 'crisis';

              return (
                <button
                  key={index}
                  role="menuitem"
                  onClick={() => handleHotlineSelect(hotline)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleHotlineSelect(hotline);
                    }
                  }}
                  className={`
                    w-full text-left
                    px-4 py-3
                    hover:bg-neutral-1
                    active:bg-neutral-2
                    transition-colors
                    focus:outline-none focus:bg-neutral-1
                    border-b border-neutral-2 last:border-b-0
                    ${isEmergency ? 'bg-red-50 hover:bg-red-100' : ''}
                    ${isCrisis ? 'bg-orange-50 hover:bg-orange-100' : ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-neutral-9">
                          {hotline.name}
                        </span>
                        {isEmergency && (
                          <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs rounded font-semibold">
                            EMERGENCY
                          </span>
                        )}
                        {isCrisis && (
                          <span className="px-1.5 py-0.5 bg-orange-600 text-white text-xs rounded font-semibold">
                            CRISIS
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-neutral-6 mb-1.5">
                        {hotline.description}
                      </p>

                      {/* Number */}
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-600 flex-shrink-0"
                          aria-hidden="true"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span className="text-sm font-mono text-red-600">
                          {formatPhoneNumber(hotline.number)}
                        </span>
                      </div>

                      {/* Availability */}
                      {hotline.available24_7 && (
                        <p className="text-xs text-green-600 mt-1.5 font-medium">
                          24/7 Available
                        </p>
                      )}
                    </div>

                    {/* Call Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-red-600 flex-shrink-0 mt-1"
                      aria-hidden="true"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-neutral-1 border-t border-neutral-2">
            <p className="text-xs text-neutral-6 text-center">
              In immediate danger? Call your local emergency number
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

