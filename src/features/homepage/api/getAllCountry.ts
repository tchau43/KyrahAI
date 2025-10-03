import axiosClient from '@/services/axiosClient';

export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  flag: string;
}

export const getAllCountries = async (): Promise<Country[]> => {
  try {
    const response = await axiosClient.get('/all?fields=name,cca2,cca3,flag');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch countries', { cause: error });
  }
};
