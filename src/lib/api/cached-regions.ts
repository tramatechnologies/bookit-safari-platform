import { regionsApi } from './regions';
import { appCache } from '@/utils/cache';
import type { Database } from '@/integrations/supabase/types';

type Region = Database['public']['Tables']['regions']['Row'];

export const cachedRegionsApi = {
  // Get all regions with caching
  async getAllRegions(): Promise<Region[]> {
    const cacheKey = 'regions-all';
    
    // Try to get from cache first
    const cached = appCache.get<Region[]>(cacheKey);
    if (cached) {
      console.log('Returning regions from cache');
      return cached;
    }
    
    // Fetch fresh data and cache it
    const data = await regionsApi.getAllRegions();
    appCache.set(cacheKey, data, 60 * 60 * 1000); // Cache for 1 hour
    
    return data;
  },

  // Get popular regions with caching
  async getPopularRegions(): Promise<Region[]> {
    const cacheKey = 'regions-popular';
    
    // Try to get from cache first
    const cached = appCache.get<Region[]>(cacheKey);
    if (cached) {
      console.log('Returning popular regions from cache');
      return cached;
    }
    
    // Fetch fresh data and cache it
    const data = await regionsApi.getPopularRegions();
    appCache.set(cacheKey, data, 60 * 60 * 1000); // Cache for 1 hour
    
    return data;
  },

  // Get region by ID with caching
  async getRegionById(regionId: string): Promise<Region | null> {
    const cacheKey = `region-${regionId}`;
    
    // Try to get from cache first
    const cached = appCache.get<Region | null>(cacheKey);
    if (cached) {
      console.log('Returning region from cache');
      return cached;
    }
    
    // Fetch fresh data and cache it
    const data = await regionsApi.getRegionById(regionId);
    if (data) {
      appCache.set(cacheKey, data, 60 * 60 * 1000); // Cache for 1 hour
    }
    
    return data;
  },
};