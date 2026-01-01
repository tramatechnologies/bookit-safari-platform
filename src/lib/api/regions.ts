import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Region = Database['public']['Tables']['regions']['Row'];

// Popular regions based on common travel routes in Tanzania
const POPULAR_REGION_CODES = [
  'DAR', // Dar es Salaam
  'ARU', // Arusha
  'MWA', // Mwanza
  'DOD', // Dodoma
  'MBE', // Mbeya
  'MOR', // Morogoro
  'TAN', // Tanga
  'KIL', // Kilimanjaro
];

export const regionsApi = {
  // Get all regions
  async getAllRegions(): Promise<Region[]> {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get popular regions (filtered by common codes)
  async getPopularRegions(): Promise<Region[]> {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .in('code', POPULAR_REGION_CODES)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get region by ID or code
  async getRegionById(regionId: string): Promise<Region | null> {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .or(`id.eq.${regionId},code.eq.${regionId}`)
      .single();

    if (error) {
      // If single() fails, try to find by code
      const { data: dataByCode } = await supabase
        .from('regions')
        .select('*')
        .eq('code', regionId)
        .maybeSingle();
      return dataByCode;
    }
    return data;
  },
};

