import { useQuery } from '@tanstack/react-query';
import { regionsApi } from '@/lib/api/regions';

export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: regionsApi.getAllRegions,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const usePopularRegions = () => {
  return useQuery({
    queryKey: ['regions', 'popular'],
    queryFn: regionsApi.getPopularRegions,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useRegion = (regionId: string) => {
  return useQuery({
    queryKey: ['region', regionId],
    queryFn: () => regionsApi.getRegionById(regionId),
    enabled: !!regionId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

