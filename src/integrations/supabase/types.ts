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
      certificates: {
        Row: {
          accuracy: number | null
          certificate_type: string
          description: string | null
          id: string
          issued_at: string
          title: string
          user_id: string
          wpm: number | null
        }
        Insert: {
          accuracy?: number | null
          certificate_type: string
          description?: string | null
          id?: string
          issued_at?: string
          title: string
          user_id: string
          wpm?: number | null
        }
        Update: {
          accuracy?: number | null
          certificate_type?: string
          description?: string | null
          id?: string
          issued_at?: string
          title?: string
          user_id?: string
          wpm?: number | null
        }
        Relationships: []
      }
      challenge_completions: {
        Row: {
          accuracy: number
          challenge_id: string
          completed_at: string
          id: string
          points_earned: number
          user_id: string
          wpm: number
        }
        Insert: {
          accuracy: number
          challenge_id: string
          completed_at?: string
          id?: string
          points_earned?: number
          user_id: string
          wpm: number
        }
        Update: {
          accuracy?: number
          challenge_id?: string
          completed_at?: string
          id?: string
          points_earned?: number
          user_id?: string
          wpm?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      custom_word_lists: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          name: string
          updated_at: string
          user_id: string
          words: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          words: string[]
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          words?: string[]
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          created_at: string
          id: string
          reward_points: number
          target_accuracy: number
          target_wpm: number
          text_content: string
        }
        Insert: {
          challenge_date: string
          challenge_type?: string
          created_at?: string
          id?: string
          reward_points?: number
          target_accuracy?: number
          target_wpm?: number
          text_content: string
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          created_at?: string
          id?: string
          reward_points?: number
          target_accuracy?: number
          target_wpm?: number
          text_content?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          created_at: string
          game_type: string
          id: string
          level_reached: number | null
          score: number
          user_id: string
          username: string | null
          words_typed: number | null
        }
        Insert: {
          created_at?: string
          game_type: string
          id?: string
          level_reached?: number | null
          score: number
          user_id: string
          username?: string | null
          words_typed?: number | null
        }
        Update: {
          created_at?: string
          game_type?: string
          id?: string
          level_reached?: number | null
          score?: number
          user_id?: string
          username?: string | null
          words_typed?: number | null
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
      practice_reminders: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          enabled: boolean | null
          id: string
          reminder_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          enabled?: boolean | null
          id?: string
          reminder_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          enabled?: boolean | null
          id?: string
          reminder_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          accuracy: number | null
          created_at: string
          details: Json | null
          duration_seconds: number
          id: string
          session_type: string
          user_id: string
          wpm: number | null
          xp_earned: number | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          details?: Json | null
          duration_seconds: number
          id?: string
          session_type: string
          user_id: string
          wpm?: number | null
          xp_earned?: number | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          details?: Json | null
          duration_seconds?: number
          id?: string
          session_type?: string
          user_id?: string
          wpm?: number | null
          xp_earned?: number | null
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
          font_size: string | null
          high_contrast: boolean | null
          id: string
          last_practice_date: string | null
          level: number | null
          line_height: string | null
          longest_streak: number | null
          reduced_motion: boolean | null
          screen_reader_mode: boolean | null
          skill_tier: string | null
          sound_enabled: boolean | null
          theme: string | null
          total_tests_completed: number | null
          total_words_typed: number | null
          updated_at: string | null
          user_id: string
          username: string | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          best_accuracy?: number | null
          best_wpm?: number | null
          created_at?: string | null
          current_streak?: number | null
          font_size?: string | null
          high_contrast?: boolean | null
          id?: string
          last_practice_date?: string | null
          level?: number | null
          line_height?: string | null
          longest_streak?: number | null
          reduced_motion?: boolean | null
          screen_reader_mode?: boolean | null
          skill_tier?: string | null
          sound_enabled?: boolean | null
          theme?: string | null
          total_tests_completed?: number | null
          total_words_typed?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          best_accuracy?: number | null
          best_wpm?: number | null
          created_at?: string | null
          current_streak?: number | null
          font_size?: string | null
          high_contrast?: boolean | null
          id?: string
          last_practice_date?: string | null
          level?: number | null
          line_height?: string | null
          longest_streak?: number | null
          reduced_motion?: boolean | null
          screen_reader_mode?: boolean | null
          skill_tier?: string | null
          sound_enabled?: boolean | null
          theme?: string | null
          total_tests_completed?: number | null
          total_words_typed?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          xp?: number | null
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
      tournament_entries: {
        Row: {
          accuracy: number
          id: string
          score: number
          submitted_at: string
          tournament_id: string
          user_id: string
          username: string | null
          wpm: number
        }
        Insert: {
          accuracy: number
          id?: string
          score: number
          submitted_at?: string
          tournament_id: string
          user_id: string
          username?: string | null
          wpm: number
        }
        Update: {
          accuracy?: number
          id?: string
          score?: number
          submitted_at?: string
          tournament_id?: string
          user_id?: string
          username?: string | null
          wpm?: number
        }
        Relationships: [
          {
            foreignKeyName: "tournament_entries_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          name: string
          prize_xp: number | null
          start_date: string
          status: string
          text_content: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          name: string
          prize_xp?: number | null
          start_date: string
          status?: string
          text_content: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          prize_xp?: number | null
          start_date?: string
          status?: string
          text_content?: string
        }
        Relationships: []
      }
      typing_goals: {
        Row: {
          completed: boolean
          created_at: string
          current_value: number
          ends_at: string
          goal_type: string
          id: string
          period: string
          started_at: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          current_value?: number
          ends_at: string
          goal_type: string
          id?: string
          period?: string
          started_at?: string
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          current_value?: number
          ends_at?: string
          goal_type?: string
          id?: string
          period?: string
          started_at?: string
          target_value?: number
          updated_at?: string
          user_id?: string
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
      leaderboard_profiles: {
        Row: {
          avatar_url: string | null
          best_accuracy: number | null
          best_wpm: number | null
          id: string | null
          level: number | null
          skill_tier: string | null
          total_tests_completed: number | null
          user_id: string | null
          username: string | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          best_accuracy?: number | null
          best_wpm?: number | null
          id?: string | null
          level?: number | null
          skill_tier?: string | null
          total_tests_completed?: number | null
          user_id?: string | null
          username?: string | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          best_accuracy?: number | null
          best_wpm?: number | null
          id?: string | null
          level?: number | null
          skill_tier?: string | null
          total_tests_completed?: number | null
          user_id?: string | null
          username?: string | null
          xp?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      begin_racing: { Args: { p_race_id: string }; Returns: undefined }
      get_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          avatar_url: string
          best_accuracy: number
          best_wpm: number
          id: string
          total_tests_completed: number
          user_id: string
          username: string
        }[]
      }
      get_or_create_daily_challenge: {
        Args: { p_date?: string }
        Returns: {
          out_challenge_date: string
          out_challenge_type: string
          out_id: string
          out_reward_points: number
          out_target_accuracy: number
          out_target_wpm: number
          out_text_content: string
        }[]
      }
      start_race: { Args: { p_race_id: string }; Returns: undefined }
      update_user_xp:
        | {
            Args: { p_user_id: string; p_xp_amount: number }
            Returns: undefined
          }
        | { Args: { p_xp_amount: number }; Returns: undefined }
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
