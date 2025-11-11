// src/hooks/useEmergencyHotline.ts
import { useState, useEffect, useCallback } from 'react';
import { detectUserRegion, getCountryName, CountryCode } from '@/services/region-detection.service';
import {
  getHotlinesForCountry,
  getPrimaryEmergencyNumber,
  EmergencyHotline,
} from '@/data/emergency-hotlines';
import { useAuth } from '@/contexts/AuthContext';
import { UserPreferences } from '@/types/auth.types';

interface UseEmergencyHotlineReturn {
  countryCode: CountryCode;
  countryName: string;
  hotlines: EmergencyHotline[];
  primaryHotline: EmergencyHotline | null;
  isLoading: boolean;
  error: Error | null;
  handleCall: (hotline: EmergencyHotline) => void;
  refreshDetection: () => void;
}

export function useEmergencyHotline(): UseEmergencyHotlineReturn {
  const { userPreferences } = useAuth();
  const [countryCode, setCountryCode] = useState<CountryCode>('GLOBAL');
  const [hotlines, setHotlines] = useState<EmergencyHotline[]>([]);
  const [primaryHotline, setPrimaryHotline] = useState<EmergencyHotline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Detect region and load hotlines
   * 
   * Why async function:
   * - Region detection may take time (if using IP geolocation in the future)
   * - May have error handling
   * - Use user preferences if available
   */
  const detectAndLoad = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Detect region (with user preferences priority)
      // Pass userPreferences directly - function only needs language and timezone fields
      const detected = detectUserRegion(userPreferences as Partial<Pick<UserPreferences, "language" | "timezone">> | undefined);
      setCountryCode(detected);

      // Load hotlines for detected region
      const regionHotlines = getHotlinesForCountry(detected);
      setHotlines(regionHotlines);

      // Get primary emergency number
      const primary = getPrimaryEmergencyNumber(detected);
      setPrimaryHotline(primary);

      setIsLoading(false);
    } catch (err) {
      console.error('Error detecting region or loading hotlines:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsLoading(false);
      
      // Fallback to GLOBAL
      setCountryCode('GLOBAL');
      setHotlines(getHotlinesForCountry('GLOBAL'));
      setPrimaryHotline(getPrimaryEmergencyNumber('GLOBAL'));
    }
  }, [userPreferences]);

  /**
   * Initialize on mount
   * 
   * Tại sao useEffect:
   * - Chỉ chạy một lần khi component mount
   * - Cleanup không cần thiết vì không có subscription
   */
  useEffect(() => {
    detectAndLoad();
  }, [detectAndLoad]);

  /**
   * Handle phone call action
   * 
   * @param hotline - Hotline object với number field
   * 
   * Tại sao function này:
   * - Centralized call logic
   * - Có thể thêm analytics tracking sau này
   * - Handle cả tel: links và plain numbers
   */
  const handleCall = useCallback((hotline: EmergencyHotline) => {
    try {
      let phoneNumber = hotline.number;

      // Ensure tel: protocol
      if (!phoneNumber.startsWith('tel:')) {
        // Remove any spaces, dashes, parentheses
        const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
        
        // Add country code if missing (assume current country)
        if (!cleaned.startsWith('+') && !cleaned.startsWith('tel:')) {
          // For now, use as-is. Could add country code detection later
          phoneNumber = `tel:${cleaned}`;
        } else {
          phoneNumber = `tel:${cleaned}`;
        }
      }

      // Open phone dialer
      window.location.href = phoneNumber;

      // Optional: Analytics tracking
      // trackHotlineCall(hotline, countryCode);
    } catch (err) {
      console.error('Error initiating phone call:', err);
      // Could show error toast here
    }
  }, []);

  /**
   * Refresh region detection
   * 
   * Useful nếu user muốn manually refresh
   */
  const refreshDetection = useCallback(() => {
    detectAndLoad();
  }, [detectAndLoad]);

  return {
    countryCode,
    countryName: getCountryName(countryCode),
    hotlines,
    primaryHotline,
    isLoading,
    error,
    handleCall,
    refreshDetection,
  };
}



