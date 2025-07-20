export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          table_name: string
          timestamp: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
subjects: {
        Row: {
          id: string
          name: string
          code: string
          department: string
          credits: number
          type: string | null
          lab_duration: number | null
          year: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          code: string
          department: string
          credits: number
          type?: string | null
          lab_duration?: number | null
          year?: number | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          code?: string
          department?: string
          credits?: number
          type?: string | null
          lab_duration?: number | null
          year?: number | null
          is_active?: boolean
        }
        Relationships: []
      }
      staff: {
        Row: {
          id: string
          name: string
          email: string
          department: string
          role: string
          max_hours: number
          current_hours: number
          subjects: string[] | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          email: string
          department: string
          role: string
          max_hours: number
          current_hours: number
          subjects?: string[] | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          email?: string
          department?: string
          role?: string
          max_hours?: number
          current_hours?: number
          subjects?: string[] | null
          is_active?: boolean
        }
        Relationships: []
      }
classrooms: {
        Row: {
          id: string
          name: string
          capacity: number
          type: string
          is_active: boolean
        }
        Insert: {
          id: string
          name: string
          capacity: number
          type: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          capacity?: number
          type?: string
          is_active?: boolean
        }
        Relationships: []
      }
      timetable_entries: {
        Row: {
          id: string
          subject_code: string
          staff_id: string
          classroom_id: string
          department: string
          semester: string
          student_group: string
          day: string
          time_slot: string
          created_at: string
        }
        Insert: {
          id?: string
          subject_code: string
          staff_id: string
          classroom_id: string
          department: string
          semester: string
          student_group: string
          day: string
          time_slot: string
          created_at?: string
        }
        Update: {
          id?: string
          subject_code?: string
          staff_id?: string
          classroom_id?: string
          department?: string
          semester?: string
          student_group?: string
          day?: string
          time_slot?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_subject_code_fkey"
            columns: ["subject_code"]
            referencedRelation: "subjects"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "timetable_entries_staff_id_fkey"
            columns: ["staff_id"]
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_classroom_id_fkey"
            columns: ["classroom_id"]
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          }
        ]
      }
      tutor_assignments: {
        Row: {
          academic_year: string
          assigned_at: string
          assigned_by: string | null
          classroom: string
          department: string
          id: string
          is_active: boolean
          semester: string
          staff_id: string
        }
        Insert: {
          academic_year: string
          assigned_at?: string
          assigned_by?: string | null
          classroom: string
          department: string
          id?: string
          is_active?: boolean
          semester: string
          staff_id: string
        }
        Update: {
          academic_year?: string
          assigned_at?: string
          assigned_by?: string | null
          classroom?: string
          department?: string
          id?: string
          is_active?: boolean
          semester?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: { user_id?: string }
        Returns: {
          role: string
          department: string
          can_manage_staff: boolean
          can_manage_timetables: boolean
          can_view_reports: boolean
          can_manage_classrooms: boolean
        }[]
      }
      is_classroom_available: {
        Args: {
          classroom_id: string
          day: string
          start_time: string
          end_time: string
          semester: string
          academic_year: string
          exclude_entry_id?: string
        }
        Returns: boolean
      }
      validate_staff_workload: {
        Args: { staff_id: string; additional_hours?: number }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
