export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_reference: string
          created_at: string
          id: string
          passenger_email: string | null
          passenger_name: string
          passenger_phone: string
          qr_code: string | null
          seat_numbers: number[]
          status: Database["public"]["Enums"]["booking_status"]
          total_amount_tzs: number
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_reference: string
          created_at?: string
          id?: string
          passenger_email?: string | null
          passenger_name: string
          passenger_phone: string
          qr_code?: string | null
          seat_numbers: number[]
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount_tzs: number
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_reference?: string
          created_at?: string
          id?: string
          passenger_email?: string | null
          passenger_name?: string
          passenger_phone?: string
          qr_code?: string | null
          seat_numbers?: number[]
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount_tzs?: number
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      bus_operators: {
        Row: {
          address: string | null
          company_name: string
          created_at: string
          description: string | null
          email: string
          id: string
          license_number: string | null
          logo_url: string | null
          phone: string
          status: Database["public"]["Enums"]["operator_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_name: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          license_number?: string | null
          logo_url?: string | null
          phone: string
          status?: Database["public"]["Enums"]["operator_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_name?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          license_number?: string | null
          logo_url?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["operator_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      buses: {
        Row: {
          amenities: string[] | null
          bus_type: string
          created_at: string
          id: string
          is_active: boolean
          operator_id: string
          registration_number: string
          total_seats: number
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          bus_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          operator_id: string
          registration_number: string
          total_seats?: number
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          bus_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          operator_id?: string
          registration_number?: string
          total_seats?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buses_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "bus_operators"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_tzs: number
          booking_id: string
          clickpesa_transaction_id: string | null
          created_at: string
          id: string
          paid_at: string | null
          payment_method: string
          payment_reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_tzs: number
          booking_id: string
          clickpesa_transaction_id?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_method: string
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_tzs?: number
          booking_id?: string
          clickpesa_transaction_id?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_method?: string
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string
          id: string
          is_popular: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_popular?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_popular?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          arrival_region_id: string
          arrival_terminal_id: string | null
          created_at: string
          departure_region_id: string
          departure_terminal_id: string | null
          distance_km: number | null
          estimated_duration_minutes: number
          id: string
          is_active: boolean
          operator_id: string
        }
        Insert: {
          arrival_region_id: string
          arrival_terminal_id?: string | null
          created_at?: string
          departure_region_id: string
          departure_terminal_id?: string | null
          distance_km?: number | null
          estimated_duration_minutes: number
          id?: string
          is_active?: boolean
          operator_id: string
        }
        Update: {
          arrival_region_id?: string
          arrival_terminal_id?: string | null
          created_at?: string
          departure_region_id?: string
          departure_terminal_id?: string | null
          distance_km?: number | null
          estimated_duration_minutes?: number
          id?: string
          is_active?: boolean
          operator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_arrival_region_id_fkey"
            columns: ["arrival_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_arrival_terminal_id_fkey"
            columns: ["arrival_terminal_id"]
            isOneToOne: false
            referencedRelation: "terminals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_departure_region_id_fkey"
            columns: ["departure_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_departure_terminal_id_fkey"
            columns: ["departure_terminal_id"]
            isOneToOne: false
            referencedRelation: "terminals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "bus_operators"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          arrival_time: string
          bus_id: string
          created_at: string
          days_of_week: number[]
          departure_time: string
          id: string
          is_active: boolean
          price_tzs: number
          route_id: string
          updated_at: string
        }
        Insert: {
          arrival_time: string
          bus_id: string
          created_at?: string
          days_of_week?: number[]
          departure_time: string
          id?: string
          is_active?: boolean
          price_tzs: number
          route_id: string
          updated_at?: string
        }
        Update: {
          arrival_time?: string
          bus_id?: string
          created_at?: string
          days_of_week?: number[]
          departure_time?: string
          id?: string
          is_active?: boolean
          price_tzs?: number
          route_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_locks: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          locked_until: string
          seat_number: number
          trip_id: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          locked_until: string
          seat_number: number
          trip_id: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          locked_until?: string
          seat_number?: number
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_locks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_locks_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      terminals: {
        Row: {
          address: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          region_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          region_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terminals_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          available_seats: number
          created_at: string
          id: string
          schedule_id: string
          status: string
          trip_date: string
        }
        Insert: {
          available_seats: number
          created_at?: string
          id?: string
          schedule_id: string
          status?: string
          trip_date: string
        }
        Update: {
          available_seats?: number
          created_at?: string
          id?: string
          schedule_id?: string
          status?: string
          trip_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_booking_reference: { Args: never; Returns: string }
      get_user_operator_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      operator_status: "pending" | "approved" | "suspended"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "passenger" | "operator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      operator_status: ["pending", "approved", "suspended"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["passenger", "operator", "admin"],
    },
  },
} as const
