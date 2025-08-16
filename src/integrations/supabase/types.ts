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
      classrooms: {
        Row: {
          building: string | null
          capacity: number
          created_at: string
          department: string
          facilities: string[] | null
          floor: number | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          building?: string | null
          capacity?: number
          created_at?: string
          department: string
          facilities?: string[] | null
          floor?: number | null
          id?: string
          is_active?: boolean
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          building?: string | null
          capacity?: number
          created_at?: string
          department?: string
          facilities?: string[] | null
          floor?: number | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
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
      staff: {
        Row: {
          created_at: string | null
          current_hours: number | null
          department: string
          email: string
          id: string
          is_active: boolean | null
          max_hours: number | null
          name: string
          role: string
          subjects: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_hours?: number | null
          department: string
          email: string
          id?: string
          is_active?: boolean | null
          max_hours?: number | null
          name: string
          role: string
          subjects?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_hours?: number | null
          department?: string
          email?: string
          id?: string
          is_active?: boolean | null
          max_hours?: number | null
          name?: string
          role?: string
          subjects?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          academic_year: string | null
          code: string
          credits: number
          department: string
          departments: string[] | null
          id: string
          is_active: boolean | null
          lab_duration: number | null
          name: string
          type: string | null
          year: number | null
        }
        Insert: {
          academic_year?: string | null
          code: string
          credits: number
          department: string
          departments?: string[] | null
          id: string
          is_active?: boolean | null
          lab_duration?: number | null
          name: string
          type?: string | null
          year?: number | null
        }
        Update: {
          academic_year?: string | null
          code?: string
          credits?: number
          department?: string
          departments?: string[] | null
          id?: string
          is_active?: boolean | null
          lab_duration?: number | null
          name?: string
          type?: string | null
          year?: number | null
        }
        Relationships: []
      }
      timetable_entries: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          day: string
          department: string
          id: string
          semester: string
          staff_id: string | null
          student_group: string
          subject_code: string | null
          time_slot: string
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          day: string
          department: string
          id?: string
          semester: string
          staff_id?: string | null
          student_group: string
          subject_code?: string | null
          time_slot: string
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          day?: string
          department?: string
          id?: string
          semester?: string
          staff_id?: string | null
          student_group?: string
          subject_code?: string | null
          time_slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_code_fkey"
            columns: ["subject_code"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["code"]
          },
        ]
      }
      timetable_year_1: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          day: string
          department: string
          id: string
          semester: string
          staff_id: string | null
          student_group: string
          subject_code: string | null
          time_slot: string
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          day: string
          department: string
          id?: string
          semester: string
          staff_id?: string | null
          student_group: string
          subject_code?: string | null
          time_slot: string
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          day?: string
          department?: string
          id?: string
          semester?: string
          staff_id?: string | null
          student_group?: string
          subject_code?: string | null
          time_slot?: string
        }
        Relationships: []
      }
      timetable_year_2: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          day: string
          department: string
          id: string
          semester: string
          staff_id: string | null
          student_group: string
          subject_code: string | null
          time_slot: string
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          day: string
          department: string
          id?: string
          semester: string
          staff_id?: string | null
          student_group: string
          subject_code?: string | null
          time_slot: string
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          day?: string
          department?: string
          id?: string
          semester?: string
          staff_id?: string | null
          student_group?: string
          subject_code?: string | null
          time_slot?: string
        }
        Relationships: []
      }
      timetable_year_3: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          day: string
          department: string
          id: string
          semester: string
          staff_id: string | null
          student_group: string
          subject_code: string | null
          time_slot: string
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          day: string
          department: string
          id?: string
          semester: string
          staff_id?: string | null
          student_group: string
          subject_code?: string | null
          time_slot: string
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          day?: string
          department?: string
          id?: string
          semester?: string
          staff_id?: string | null
          student_group?: string
          subject_code?: string | null
          time_slot?: string
        }
        Relationships: []
      }
      timetable_year_4: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          day: string
          department: string
          id: string
          semester: string
          staff_id: string | null
          student_group: string
          subject_code: string | null
          time_slot: string
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          day: string
          department: string
          id?: string
          semester: string
          staff_id?: string | null
          student_group: string
          subject_code?: string | null
          time_slot: string
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          day?: string
          department?: string
          id?: string
          semester?: string
          staff_id?: string | null
          student_group?: string
          subject_code?: string | null
          time_slot?: string
        }
        Relationships: []
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
          staff_id: string
          year_group: string
        }
        Insert: {
          academic_year: string
          assigned_at?: string
          assigned_by?: string | null
          classroom: string
          department: string
          id?: string
          is_active?: boolean
          staff_id: string
          year_group?: string
        }
        Update: {
          academic_year?: string
          assigned_at?: string
          assigned_by?: string | null
          classroom?: string
          department?: string
          id?: string
          is_active?: boolean
          staff_id?: string
          year_group?: string
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
      check_admin_permission: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: { user_id?: string }
        Returns: {
          can_manage_classrooms: boolean
          can_manage_staff: boolean
          can_manage_timetables: boolean
          can_view_reports: boolean
          department: string
          role: string
        }[]
      }
      is_classroom_available: {
        Args: {
          academic_year: string
          classroom_id: string
          day: string
          end_time: string
          exclude_entry_id?: string
          semester: string
          start_time: string
        }
        Returns: boolean
      }
      validate_staff_workload: {
        Args: { additional_hours?: number; staff_id: string }
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
