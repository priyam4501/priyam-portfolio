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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          created_at: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coding_stats: {
        Row: {
          created_at: string
          display_order: number
          handle: string
          id: string
          is_published: boolean
          platform: string
          problems_solved: number | null
          profile_url: string | null
          rank_label: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          handle: string
          id?: string
          is_published?: boolean
          platform: string
          problems_solved?: number | null
          profile_url?: string | null
          rank_label?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          handle?: string
          id?: string
          is_published?: boolean
          platform?: string
          problems_solved?: number | null
          profile_url?: string | null
          rank_label?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      experience: {
        Row: {
          company: string
          created_at: string
          description: string[]
          display_order: number
          end_date: string | null
          id: string
          is_published: boolean
          location: string | null
          role: string
          stack_tags: string[]
          start_date: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string[]
          display_order?: number
          end_date?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          role: string
          stack_tags?: string[]
          start_date: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string[]
          display_order?: number
          end_date?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          role?: string
          stack_tags?: string[]
          start_date?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          location: string | null
          seo_description: string | null
          seo_og_image_url: string | null
          seo_title: string | null
          tagline: string | null
          title: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          location?: string | null
          seo_description?: string | null
          seo_og_image_url?: string | null
          seo_title?: string | null
          tagline?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          location?: string | null
          seo_description?: string | null
          seo_og_image_url?: string | null
          seo_title?: string | null
          tagline?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          case_study_url: string | null
          category: string
          cover_image_url: string | null
          created_at: string
          display_order: number
          gallery_urls: string[]
          id: string
          is_featured: boolean
          is_published: boolean
          live_url: string | null
          narrative: Json
          repo_url: string | null
          role: string | null
          slug: string
          stack_tags: string[]
          summary: string
          timeframe: string | null
          title: string
        }
        Insert: {
          case_study_url?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          display_order?: number
          gallery_urls?: string[]
          id?: string
          is_featured?: boolean
          is_published?: boolean
          live_url?: string | null
          narrative?: Json
          repo_url?: string | null
          role?: string | null
          slug: string
          stack_tags?: string[]
          summary?: string
          timeframe?: string | null
          title: string
        }
        Update: {
          case_study_url?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          display_order?: number
          gallery_urls?: string[]
          id?: string
          is_featured?: boolean
          is_published?: boolean
          live_url?: string | null
          narrative?: Json
          repo_url?: string | null
          role?: string | null
          slug?: string
          stack_tags?: string[]
          summary?: string
          timeframe?: string | null
          title?: string
        }
        Relationships: []
      }
      resume_versions: {
        Row: {
          created_at: string
          file_size_label: string | null
          file_url: string
          id: string
          is_active: boolean
          updated_at: string
          version_label: string | null
        }
        Insert: {
          created_at?: string
          file_size_label?: string | null
          file_url: string
          id?: string
          is_active?: boolean
          updated_at?: string
          version_label?: string | null
        }
        Update: {
          created_at?: string
          file_size_label?: string | null
          file_url?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          version_label?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          display_order: number
          icon_key: string | null
          id: string
          is_published: boolean
          name: string
          proficiency: number
        }
        Insert: {
          category: string
          created_at?: string
          display_order?: number
          icon_key?: string | null
          id?: string
          is_published?: boolean
          name: string
          proficiency?: number
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number
          icon_key?: string | null
          id?: string
          is_published?: boolean
          name?: string
          proficiency?: number
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          platform: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          platform: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          platform?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
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
