/**
 * Type definitions for the application
 */

export type { ScheduleWithDetails } from '@/lib/api/schedules';
export type { Database } from '@/integrations/supabase/types';

// Import Schedule type from Supabase
import type { Database } from '@/integrations/supabase/types';

export type Schedule = Database['public']['Tables']['schedules']['Row'];

// Other common types can be added here as needed
