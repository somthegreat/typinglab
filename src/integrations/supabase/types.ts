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
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          attempts: number | null
          best_accuracy: number | null
          best_wpm: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          unlocked: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          best_accuracy?: number | null
          best_wpm?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          unlocked?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          best_accuracy?: number | null
          best_wpm?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          unlocked?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          category: string
          content: string
          created_at: string | null
          description: string | null
          difficulty: number | null
          id: string
          keys_focus: string[]
          order_index: number
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          id?: string
          keys_focus: string[]
          order_index: number
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          id?: string
          keys_focus?: string[]
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_accuracy: number | null
          best_wpm: number | null
          created_at: string | null
          current_streak: number | null
          id: string
          last_practice_date: string | null
          longest_streak: number | null
          sound_enabled: boolean | null
          theme: string | null
          total_tests_completed: number | null
          total_words_typed: number | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          best_accuracy?: number | null
          best_wpm?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_practice_date?: string | null
          longest_streak?: number | null
          sound_enabled?: boolean | null
          theme?: string | null
          total_tests_completed?: number | null
          total_words_typed?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          best_accuracy?: number | null
          best_wpm?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_practice_date?: string | null
          longest_streak?: number | null
          sound_enabled?: boolean | null
          theme?: string | null
          total_tests_completed?: number | null
          total_words_typed?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      race_participants: {
        Row: {
          accuracy: number | null
          created_at: string
          finished_at: string | null
          id: string
          position: number | null
          progress: number | null
          race_id: string
          user_id: string
          username: string | null
          wpm: number | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          finished_at?: string | null
          id?: string
          position?: number | null
          progress?: number | null
          race_id: string
          user_id: string
          username?: string | null
          wpm?: number | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          finished_at?: string | null
          id?: string
          position?: number | null
          progress?: number | null
          race_id?: string
          user_id?: string
          username?: string | null
          wpm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "race_participants_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      races: {
        Row: {
          created_at: string
          finished_at: string | null
          host_id: string
          id: string
          max_players: number | null
          started_at: string | null
          status: string
          text_content: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          host_id: string
          id?: string
          max_players?: number | null
          started_at?: string | null
          status?: string
          text_content: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          host_id?: string
          id?: string
          max_players?: number | null
          started_at?: string | null
          status?: string
          text_content?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          accuracy: number
          correct_chars: number
          created_at: string | null
          id: string
          incorrect_chars: number
          raw_wpm: number
          test_duration: number | null
          test_mode: string
          text_content: string | null
          total_chars: number
          user_id: string
          word_count: number | null
          wpm: number
        }
        Insert: {
          accuracy: number
          correct_chars: number
          created_at?: string | null
          id?: string
          incorrect_chars: number
          raw_wpm: number
          test_duration?: number | null
          test_mode: string
          text_content?: string | null
          total_chars: number
          user_id: string
          word_count?: number | null
          wpm: number
        }
        Update: {
          accuracy?: number
          correct_chars?: number
          created_at?: string | null
          id?: string
          incorrect_chars?: number
          raw_wpm?: number
          test_duration?: number | null
          test_mode?: string
          text_content?: string | null
          total_chars?: number
          user_id?: string
          word_count?: number | null
          wpm?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      weak_keys: {
        Row: {
          error_count: number | null
          id: string
          key_char: string
          total_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          error_count?: number | null
          id?: string
          key_char: string
          total_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          error_count?: number | null
          id?: string
          key_char?: string
          total_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
