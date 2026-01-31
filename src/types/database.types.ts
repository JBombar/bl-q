/**
 * Database Types - Generated from Supabase
 * Last updated: 2026-01-31
 * Project: nsvezpwooztjxnmxjtpw
 */

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
      orders: {
        Row: {
          amount_cents: number
          card_brand: string | null
          card_last4: string | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          order_number: string
          paid_at: string | null
          payment_method_type: string | null
          product_id: string
          product_name: string
          refunded_at: string | null
          result_id: string | null
          session_id: string
          status: string
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents: number
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          order_number: string
          paid_at?: string | null
          payment_method_type?: string | null
          product_id: string
          product_name: string
          refunded_at?: string | null
          result_id?: string | null
          session_id: string
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          order_number?: string
          paid_at?: string | null
          payment_method_type?: string | null
          product_id?: string
          product_name?: string
          refunded_at?: string | null
          result_id?: string | null
          session_id?: string
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "quiz_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_answers: {
        Row: {
          answer_score: number | null
          answer_value: string | null
          created_at: string | null
          id: string
          question_id: string
          selected_option_ids: string[]
          session_id: string
          time_spent_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          answer_score?: number | null
          answer_value?: string | null
          created_at?: string | null
          id?: string
          question_id: string
          selected_option_ids: string[]
          session_id: string
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          answer_score?: number | null
          answer_value?: string | null
          created_at?: string | null
          id?: string
          question_id?: string
          selected_option_ids?: string[]
          session_id?: string
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          quiz_id: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          quiz_id?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          quiz_id?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_events_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          option_text: string
          option_value: string
          order_index: number
          question_id: string
          score_value: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          option_text: string
          option_value: string
          order_index: number
          question_id: string
          score_value?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          option_text?: string
          option_value?: string
          order_index?: number
          question_id?: string
          score_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          branching_logic: Json | null
          created_at: string | null
          helper_text: string | null
          id: string
          image_url: string | null
          order_index: number
          question_key: string | null
          question_subtext: string | null
          question_text: string
          question_type: string
          quiz_id: string
          required: boolean | null
          scale_left_label: string | null
          scale_right_label: string | null
          section_label: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          branching_logic?: Json | null
          created_at?: string | null
          helper_text?: string | null
          id?: string
          image_url?: string | null
          order_index: number
          question_key?: string | null
          question_subtext?: string | null
          question_text: string
          question_type: string
          quiz_id: string
          required?: boolean | null
          scale_left_label?: string | null
          scale_right_label?: string | null
          section_label?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          branching_logic?: Json | null
          created_at?: string | null
          helper_text?: string | null
          id?: string
          image_url?: string | null
          order_index?: number
          question_key?: string | null
          question_subtext?: string | null
          question_text?: string
          question_type?: string
          quiz_id?: string
          required?: boolean | null
          scale_left_label?: string | null
          scale_right_label?: string | null
          section_label?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          calculation_details: Json | null
          calculation_method: string | null
          created_at: string | null
          id: string
          quiz_id: string
          recommended_price_cents: number | null
          recommended_product_id: string | null
          recommended_product_name: string | null
          result_description: string | null
          result_label: string | null
          result_score: number | null
          result_type: string
          result_value: string
          session_id: string
        }
        Insert: {
          calculation_details?: Json | null
          calculation_method?: string | null
          created_at?: string | null
          id?: string
          quiz_id: string
          recommended_price_cents?: number | null
          recommended_product_id?: string | null
          recommended_product_name?: string | null
          result_description?: string | null
          result_label?: string | null
          result_score?: number | null
          result_type: string
          result_value: string
          session_id: string
        }
        Update: {
          calculation_details?: Json | null
          calculation_method?: string | null
          created_at?: string | null
          id?: string
          quiz_id?: string
          recommended_price_cents?: number | null
          recommended_product_id?: string | null
          recommended_product_name?: string | null
          result_description?: string | null
          result_label?: string | null
          result_score?: number | null
          result_type?: string
          result_value?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          completed_at: string | null
          completed_purchase: boolean | null
          created_at: string | null
          current_question_index: number | null
          email: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          quiz_id: string
          quiz_version: number
          referrer: string | null
          session_token: string
          updated_at: string | null
          user_agent: string | null
          user_metadata: Json | null
          utm_params: Json | null
        }
        Insert: {
          completed_at?: string | null
          completed_purchase?: boolean | null
          created_at?: string | null
          current_question_index?: number | null
          email?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          quiz_id: string
          quiz_version: number
          referrer?: string | null
          session_token: string
          updated_at?: string | null
          user_agent?: string | null
          user_metadata?: Json | null
          utm_params?: Json | null
        }
        Update: {
          completed_at?: string | null
          completed_purchase?: boolean | null
          created_at?: string | null
          current_question_index?: number | null
          email?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          quiz_id?: string
          quiz_version?: number
          referrer?: string | null
          session_token?: string
          updated_at?: string | null
          user_agent?: string | null
          user_metadata?: Json | null
          utm_params?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          offer_mapping: Json
          published_at: string | null
          result_config: Json
          result_type: string
          slug: string
          status: string
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          offer_mapping: Json
          published_at?: string | null
          result_config: Json
          result_type: string
          slug: string
          status?: string
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          offer_mapping?: Json
          published_at?: string | null
          result_config?: Json
          result_type?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
          version?: number | null
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

// ============================================================================
// CONVENIENCE TYPE EXPORTS
// ============================================================================

export type Quiz = Database['public']['Tables']['quizzes']['Row'];
export type QuizInsert = Database['public']['Tables']['quizzes']['Insert'];
export type QuizUpdate = Database['public']['Tables']['quizzes']['Update'];

export type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row'];
export type QuizQuestionInsert = Database['public']['Tables']['quiz_questions']['Insert'];
export type QuizQuestionUpdate = Database['public']['Tables']['quiz_questions']['Update'];

export type QuizOption = Database['public']['Tables']['quiz_options']['Row'];
export type QuizOptionInsert = Database['public']['Tables']['quiz_options']['Insert'];
export type QuizOptionUpdate = Database['public']['Tables']['quiz_options']['Update'];

export type QuizSession = Database['public']['Tables']['quiz_sessions']['Row'];
export type QuizSessionInsert = Database['public']['Tables']['quiz_sessions']['Insert'];
export type QuizSessionUpdate = Database['public']['Tables']['quiz_sessions']['Update'];

export type QuizAnswer = Database['public']['Tables']['quiz_answers']['Row'];
export type QuizAnswerInsert = Database['public']['Tables']['quiz_answers']['Insert'];
export type QuizAnswerUpdate = Database['public']['Tables']['quiz_answers']['Update'];

export type QuizResult = Database['public']['Tables']['quiz_results']['Row'];
export type QuizResultInsert = Database['public']['Tables']['quiz_results']['Insert'];
export type QuizResultUpdate = Database['public']['Tables']['quiz_results']['Update'];

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export type QuizEvent = Database['public']['Tables']['quiz_events']['Row'];
export type QuizEventInsert = Database['public']['Tables']['quiz_events']['Insert'];
export type QuizEventUpdate = Database['public']['Tables']['quiz_events']['Update'];
