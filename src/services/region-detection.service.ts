/**
 * Region Detection Service
 * 
 * Tự động phát hiện region/country của user để hiển thị hotline phù hợp
 * 
 * Strategy (Priority order):
 * 1. User preferences (language/timezone từ database) - Most accurate, user's explicit choice
 * 2. Browser locale (navigator.language) - Fast, no API call
 * 3. Timezone detection - Fallback nếu locale không đủ
 * 4. IP geolocation - Optional, có thể thêm sau
 * 
 * Tại sao approach này:
 * - User preferences: Chính xác nhất, user đã set preference rõ ràng
 * - Browser locale: Nhanh, không cần API, đủ cho hầu hết cases
 * - Timezone: Fallback tốt, không cần permission
 * - IP geolocation: Chính xác nhất nhưng cần API call, có thể thêm sau
 */

import type { UserPreferences } from '@/types/auth.types';

export type CountryCode =
  | 'US' // United States
  | 'GB' // United Kingdom
  | 'CA' // Canada
  | 'AU' // Australia
  | 'NZ' // New Zealand
  | 'IE' // Ireland
  | 'IN' // India
  | 'PH' // Philippines
  | 'SG' // Singapore
  | 'MY' // Malaysia
  | 'VN' // Vietnam
  | 'TH' // Thailand
  | 'ID' // Indonesia
  | 'JP' // Japan
  | 'KR' // South Korea
  | 'CN' // China
  | 'FR' // France
  | 'DE' // Germany
  | 'ES' // Spain
  | 'IT' // Italy
  | 'NL' // Netherlands
  | 'BE' // Belgium
  | 'CH' // Switzerland
  | 'AT' // Austria
  | 'SE' // Sweden
  | 'NO' // Norway
  | 'DK' // Denmark
  | 'FI' // Finland
  | 'PL' // Poland
  | 'BR' // Brazil
  | 'MX' // Mexico
  | 'AR' // Argentina
  | 'ZA' // South Africa
  | 'GLOBAL'; // Fallback

/**
 * Map language code to country code
 * 
 * Maps common language codes to their primary country
 * Examples: 'vi' -> 'VN', 'en' -> 'US' (default), 'en-GB' -> 'GB'
 */
function languageToCountryCode(language: string): CountryCode | null {
  // Normalize language (lowercase, remove spaces)
  const normalized = language.toLowerCase().trim();

  // Map language codes to countries
  const languageMap: Record<string, CountryCode> = {
    // Vietnamese
    'vi': 'VN',
    'vi-vn': 'VN',

    // English variants
    'en': 'US', // Default English to US
    'en-us': 'US',
    'en-gb': 'GB',
    'en-ca': 'CA',
    'en-au': 'AU',
    'en-nz': 'NZ',
    'en-ie': 'IE',
    'en-in': 'IN',
    'en-ph': 'PH',
    'en-sg': 'SG',
    'en-my': 'MY',

    // Other languages
    'fr': 'FR',
    'fr-fr': 'FR',
    'fr-ca': 'CA',
    'de': 'DE',
    'de-de': 'DE',
    'es': 'ES',
    'es-es': 'ES',
    'es-mx': 'MX',
    'es-ar': 'AR',
    'it': 'IT',
    'it-it': 'IT',
    'nl': 'NL',
    'nl-nl': 'NL',
    'nl-be': 'BE',
    'ja': 'JP',
    'ja-jp': 'JP',
    'ko': 'KR',
    'ko-kr': 'KR',
    'zh': 'CN',
    'zh-cn': 'CN',
    'th': 'TH',
    'th-th': 'TH',
    'id': 'ID',
    'id-id': 'ID',
    'ms': 'MY',
    'ms-my': 'MY',
    'pt': 'BR',
    'pt-br': 'BR',
    'pl': 'PL',
    'pl-pl': 'PL',
    'sv': 'SE',
    'sv-se': 'SE',
    'no': 'NO',
    'no-no': 'NO',
    'da': 'DK',
    'da-dk': 'DK',
    'fi': 'FI',
    'fi-fi': 'FI',
  };

  // Check exact match first
  if (languageMap[normalized]) {
    return languageMap[normalized];
  }

  // Check if it's a locale format (e.g., 'en-US')
  const parts = normalized.split('-');
  if (parts.length >= 2) {
    const country = parts[1].toUpperCase();
    const validCodes: CountryCode[] = [
      'US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'IN', 'PH', 'SG', 'MY',
      'VN', 'TH', 'ID', 'JP', 'KR', 'CN', 'FR', 'DE', 'ES', 'IT',
      'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'PL', 'BR',
      'MX', 'AR', 'ZA'
    ];
    if (validCodes.includes(country as CountryCode)) {
      return country as CountryCode;
    }
  }

  // Check language base (e.g., 'en' from 'en-US')
  if (parts.length > 0 && languageMap[parts[0]]) {
    return languageMap[parts[0]];
  }

  return null;
}

/**
 * Map browser locale to country code
 * Format: 'en-US' -> 'US', 'en-GB' -> 'GB', etc.
 */
function localeToCountryCode(locale: string): CountryCode | null {
  // Use languageToCountryCode for consistency
  return languageToCountryCode(locale);
}

/**
 * Map timezone to country code
 * Fallback method khi locale không đủ thông tin
 */
function timezoneToCountryCode(timezone: string): CountryCode {
  const timezoneMap: Record<string, CountryCode> = {
    // US timezones
    'America/New_York': 'US',
    'America/Chicago': 'US',
    'America/Denver': 'US',
    'America/Los_Angeles': 'US',
    'America/Phoenix': 'US',
    'America/Anchorage': 'US',
    'America/Adak': 'US',
    'Pacific/Honolulu': 'US',

    // UK
    'Europe/London': 'GB',

    // Canada
    'America/Toronto': 'CA',
    'America/Vancouver': 'CA',
    'America/Edmonton': 'CA',
    'America/Winnipeg': 'CA',
    'America/Halifax': 'CA',
    'America/St_Johns': 'CA',

    // Australia
    'Australia/Sydney': 'AU',
    'Australia/Melbourne': 'AU',
    'Australia/Brisbane': 'AU',
    'Australia/Perth': 'AU',
    'Australia/Adelaide': 'AU',
    'Australia/Darwin': 'AU',

    // New Zealand
    'Pacific/Auckland': 'NZ',

    // India
    'Asia/Kolkata': 'IN',

    // Philippines
    'Asia/Manila': 'PH',

    // Singapore
    'Asia/Singapore': 'SG',

    // Malaysia
    'Asia/Kuala_Lumpur': 'MY',

    // Vietnam
    'Asia/Ho_Chi_Minh': 'VN',

    // Thailand
    'Asia/Bangkok': 'TH',

    // Indonesia
    'Asia/Jakarta': 'ID',

    // Japan
    'Asia/Tokyo': 'JP',

    // South Korea
    'Asia/Seoul': 'KR',

    // China
    'Asia/Shanghai': 'CN',
    'Asia/Beijing': 'CN',

    // Europe
    'Europe/Paris': 'FR',
    'Europe/Berlin': 'DE',
    'Europe/Madrid': 'ES',
    'Europe/Rome': 'IT',
    'Europe/Amsterdam': 'NL',
    'Europe/Brussels': 'BE',
    'Europe/Zurich': 'CH',
    'Europe/Vienna': 'AT',
    'Europe/Stockholm': 'SE',
    'Europe/Oslo': 'NO',
    'Europe/Copenhagen': 'DK',
    'Europe/Helsinki': 'FI',
    'Europe/Warsaw': 'PL',

    // South America
    'America/Sao_Paulo': 'BR',
    'America/Mexico_City': 'MX',
    'America/Buenos_Aires': 'AR',

    // South Africa
    'Africa/Johannesburg': 'ZA',
  };

  return timezoneMap[timezone] || 'GLOBAL';
}

export function detectUserRegion(userPreferences?: Partial<Pick<UserPreferences, 'language' | 'timezone'>>): CountryCode {
  // Strategy 1: User preferences (HIGHEST PRIORITY)
  if (userPreferences) {
    // Try language first
    if (userPreferences.language) {
      const langCode = languageToCountryCode(userPreferences.language);
      if (langCode) {
        return langCode;
      }
    }

    // Fallback to timezone from preferences
    if (userPreferences.timezone) {
      const tzCode = timezoneToCountryCode(userPreferences.timezone);
      if (tzCode && tzCode !== 'GLOBAL') {
        return tzCode;
      }
    }
  }

  // Strategy 2: Browser locale
  if (typeof window !== 'undefined' && navigator.language) {
    const localeCode = localeToCountryCode(navigator.language);
    if (localeCode) {
      return localeCode;
    }

    // Try all languages if first one fails
    if (navigator.languages) {
      for (const lang of navigator.languages) {
        const code = localeToCountryCode(lang);
        if (code) {
          return code;
        }
      }
    }
  }

  // Strategy 3: Timezone detection
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzCode = timezoneToCountryCode(timezone);
      if (tzCode && tzCode !== 'GLOBAL') {
        return tzCode;
      }
    } catch (error) {
      console.warn('Failed to detect timezone:', error);
    }
  }

  // Strategy 4: Fallback to GLOBAL
  return 'GLOBAL';
}

/**
 * Get country name from country code
 * Useful for display purposes
 */
export function getCountryName(code: CountryCode): string {
  const countryNames: Record<CountryCode, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'NZ': 'New Zealand',
    'IE': 'Ireland',
    'IN': 'India',
    'PH': 'Philippines',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'VN': 'Vietnam',
    'TH': 'Thailand',
    'ID': 'Indonesia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'FR': 'France',
    'DE': 'Germany',
    'ES': 'Spain',
    'IT': 'Italy',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PL': 'Poland',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'AR': 'Argentina',
    'ZA': 'South Africa',
    'GLOBAL': 'Global',
  };

  return countryNames[code] || 'Global';
}
