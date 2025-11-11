/**
 * Emergency Hotlines Data
 * 
 * Database của các số hotline khẩn cấp theo từng quốc gia
 * 
 * Tại sao structure này:
 * - Map country code → hotlines: Dễ lookup, O(1) access
 * - Mỗi hotline có đầy đủ thông tin: name, number, description, type
 * - Sorted by priority: Emergency numbers trước, support lines sau
 * - Format số điện thoại chuẩn: tel: protocol để có thể click-to-call
 */

import { CountryCode } from '@/services/region-detection.service';

export type HotlineType = 'emergency' | 'crisis' | 'support';

export interface EmergencyHotline {
  name: string;
  number: string; // Format: tel:+1234567890 hoặc số thường
  description: string;
  type: HotlineType;
  available24_7?: boolean;
  languages?: string[];
}

export type EmergencyHotlinesMap = Record<CountryCode, EmergencyHotline[]>;

/**
 * Emergency hotlines database
 * 
 * Priority order:
 * 1. Emergency services (911, 999, etc.)
 * 2. Crisis/suicide prevention (988, Samaritans, etc.)
 * 3. Support hotlines (domestic violence, sexual assault, etc.)
 */
export const EMERGENCY_HOTLINES: EmergencyHotlinesMap = {
  // United States
  US: [
    {
      name: '911 Emergency',
      number: 'tel:911',
      description: 'Emergency services (police, fire, medical)',
      type: 'emergency',
      available24_7: true,
    },
    {
      name: '988 Suicide & Crisis Lifeline',
      number: 'tel:988',
      description: 'Free, confidential 24/7 support for people in distress',
      type: 'crisis',
      available24_7: true,
      languages: ['en', 'es'],
    },
    {
      name: 'National Domestic Violence Hotline',
      number: 'tel:+18007997233',
      description: '1-800-799-SAFE (7233) - 24/7 support for domestic violence',
      type: 'support',
      available24_7: true,
      languages: ['en', 'es'],
    },
    {
      name: 'RAINN Sexual Violence Hotline',
      number: 'tel:+18006564673',
      description: '1-800-656-HOPE (4673) - Sexual assault support',
      type: 'support',
      available24_7: true,
    },
  ],

  // United Kingdom
  GB: [
    {
      name: '999 Emergency',
      number: 'tel:999',
      description: 'Emergency services (police, fire, medical)',
      type: 'emergency',
      available24_7: true,
    },
    {
      name: 'Samaritans',
      number: 'tel:116123',
      description: '116 123 - Free, confidential 24/7 emotional support',
      type: 'crisis',
      available24_7: true,
    },
    {
      name: 'Women\'s Aid',
      number: 'tel:08082000247',
      description: '0808 2000 247 - Domestic abuse support',
      type: 'support',
      available24_7: true,
    },
    {
      name: 'Rape Crisis',
      number: 'tel:08088029999',
      description: '0808 802 9999 - Sexual violence support',
      type: 'support',
      available24_7: true,
    },
  ],

  // Canada
  CA: [
    {
      name: '911 Emergency',
      number: 'tel:911',
      description: 'Emergency services',
      type: 'emergency',
      available24_7: true,
    },
    {
      name: 'Crisis Services Canada',
      number: 'tel:8334564566',
      description: '1-833-456-4566 - Suicide prevention',
      type: 'crisis',
      available24_7: true,
      languages: ['en', 'fr'],
    },
    {
      name: 'Assaulted Women\'s Helpline',
      number: 'tel:4168630511',
      description: '416-863-0511 - Domestic violence support',
      type: 'support',
      available24_7: true,
    },
  ],

  // Australia
  AU: [
    {
      name: '000 Emergency',
      number: 'tel:000',
      description: 'Emergency services',
      type: 'emergency',
      available24_7: true,
    },
    {
      name: 'Lifeline Australia',
      number: 'tel:131114',
      description: '13 11 14 - 24/7 crisis support',
      type: 'crisis',
      available24_7: true,
    },
    {
      name: '1800RESPECT',
      number: 'tel:1800737732',
      description: '1800 737 732 - Sexual assault & domestic violence',
      type: 'support',
      available24_7: true,
    },
  ],

  // Vietnam
  VN: [
    {
      name: '113 Emergency',
      number: 'tel:113',
      description: 'Cảnh sát (Police)',
      type: 'emergency',
      available24_7: true,
    },
    {
      name: '115 Emergency',
      number: 'tel:115',
      description: 'Cấp cứu y tế (Medical emergency)',
      type: 'emergency',
      available24_7: true,
    },
    {
      name: '111 Emergency',
      number: 'tel:111',
      description: 'Cứu hỏa (Fire)',
      type: 'emergency',
      available24_7: true,
    },
    {
      name: 'Befrienders Vietnam',
      number: 'tel:02838230777',
      description: '028 3823 0777 - Suicide prevention',
      type: 'crisis',
      available24_7: true,
      languages: ['vi', 'en'],
    },
  ],

  // Global fallback
  GLOBAL: [
    {
      name: 'International Emergency',
      number: 'tel:112',
      description: '112 - International emergency number (works in many countries)',
      type: 'emergency',
      available24_7: true,
    },
    {
      name: 'Befrienders Worldwide',
      number: 'tel:+442079412222',
      description: 'Find local suicide prevention hotlines',
      type: 'crisis',
      available24_7: true,
    },
    {
      name: 'International Crisis Text Line',
      number: 'tel:+442079412222',
      description: 'Text-based crisis support',
      type: 'crisis',
      available24_7: true,
    },
  ],

  // Add more countries as needed
  // Template:
  // [COUNTRY_CODE]: [
  //   {
  //     name: 'Emergency Service Name',
  //     number: 'tel:+1234567890',
  //     description: 'Description',
  //     type: 'emergency' | 'crisis' | 'support',
  //     available24_7: true,
  //   },
  // ],
};

/**
 * Get emergency hotlines for a specific country
 * 
 * @param countryCode - Country code (e.g., 'US', 'GB', 'VN')
 * @returns Array of emergency hotlines, or GLOBAL hotlines if country not found
 */
export function getHotlinesForCountry(countryCode: CountryCode): EmergencyHotline[] {
  return EMERGENCY_HOTLINES[countryCode] || EMERGENCY_HOTLINES.GLOBAL;
}

/**
 * Get primary emergency number for a country
 * Usually the first emergency service (911, 999, etc.)
 */
export function getPrimaryEmergencyNumber(countryCode: CountryCode): EmergencyHotline | null {
  const hotlines = getHotlinesForCountry(countryCode);
  return hotlines.find(h => h.type === 'emergency') || hotlines[0] || null;
}

/**
 * Format phone number for display
 * Converts tel: links to readable format
 */
export function formatPhoneNumber(number: string): string {
  // Remove tel: prefix
  let cleaned = number.replace(/^tel:/, '');
  
  // Handle simple numbers (911, 999, etc.)
  if (/^\d{3,4}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Format US numbers: +18007997233 -> 1-800-799-7233
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    const digits = cleaned.slice(2);
    return `1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Format UK numbers: 116123 -> 116 123
  if (cleaned.length === 6 && /^\d+$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  
  // Format numbers with country code: +442079412222 -> +44 20 7941 2222
  if (cleaned.startsWith('+') && cleaned.length > 6) {
    // Simple formatting: add space after country code if long enough
    if (cleaned.length > 8) {
      const countryCode = cleaned.slice(0, 3); // Assume 2-digit country code + space
      const rest = cleaned.slice(3);
      return `${countryCode} ${rest}`;
    }
  }
  
  // Return as-is for other formats
  return cleaned;
}

