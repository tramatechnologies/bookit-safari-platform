import { useQuery } from '@tanstack/react-query';
import { cachedRegionsApi } from '@/lib/api/cached-regions';

export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: cachedRegionsApi.getAllRegions,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const usePopularRegions = () => {
  return useQuery({
    queryKey: ['regions', 'popular'],
    queryFn: cachedRegionsApi.getPopularRegions,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useRegion = (regionId: string) => {
  return useQuery({
    queryKey: ['region', regionId],
    queryFn: () => cachedRegionsApi.getRegionById(regionId),
    enabled: !!regionId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

