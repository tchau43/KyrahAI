import { useQuery } from '@tanstack/react-query';
import { getAllCountries, Country } from '../api/getAllCountry';

export const useGetAllCountries = () => {
  return useQuery<Country[], Error>({
    queryKey: ['countries'],
    queryFn: getAllCountries,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
