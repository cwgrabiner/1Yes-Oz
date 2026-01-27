/**
 * TypeScript types for Supabase database schema (Phase 2)
 * Generated from supabase/migrations/20240101000000_phase2_memory_shell.sql
 */

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
      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
        };
      };
      career_files: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          current_role: string | null;
          target_role: string | null;
          goals: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          current_role?: string | null;
          target_role?: string | null;
          goals?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          current_role?: string | null;
          target_role?: string | null;
          goals?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          title_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          title_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          title_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at: string;
          client_msg_id: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at?: string;
          client_msg_id?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          created_at?: string;
          client_msg_id?: string | null;
        };
      };
      memory_items: {
        Row: {
          id: string;
          user_id: string;
          key: string;
          value: string;
          source: string;
          confidence: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          key: string;
          value: string;
          source?: string;
          confidence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          key?: string;
          value?: string;
          source?: string;
          confidence?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
