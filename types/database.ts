export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          company: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
        };
      };
      brands: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          name: string;
          website_url: string | null;
          industry: string | null;
          entity_type: string;
          description: string | null;
          logo_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          name: string;
          website_url?: string | null;
          industry?: string | null;
          entity_type: string;
          description?: string | null;
          logo_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          name?: string;
          website_url?: string | null;
          industry?: string | null;
          entity_type?: string;
          description?: string | null;
          logo_url?: string | null;
        };
      };
      prompts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          brand_id: string;
          prompt_text: string;
          category: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          brand_id: string;
          prompt_text: string;
          category?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          brand_id?: string;
          prompt_text?: string;
          category?: string | null;
          is_active?: boolean;
        };
      };
      tracking_sessions: {
        Row: {
          id: string;
          created_at: string;
          brand_id: string;
          prompt_id: string;
          ai_engine: string;
          status: string;
          response_text: string | null;
          citations: Json | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          brand_id: string;
          prompt_id: string;
          ai_engine: string;
          status: string;
          response_text?: string | null;
          citations?: Json | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          brand_id?: string;
          prompt_id?: string;
          ai_engine?: string;
          status?: string;
          response_text?: string | null;
          citations?: Json | null;
          metadata?: Json | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
