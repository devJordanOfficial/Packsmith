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
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      modpacks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          minecraft_version: string;
          mod_loader: string;
          mod_loader_version: string;
          logo_url: string | null;
          version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          minecraft_version: string;
          mod_loader: string;
          mod_loader_version: string;
          logo_url?: string | null;
          version?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          minecraft_version?: string;
          mod_loader?: string;
          mod_loader_version?: string;
          logo_url?: string | null;
          version?: string;
          updated_at?: string;
        };
      };
      modpack_mods: {
        Row: {
          id: string;
          modpack_id: string;
          project_id: number;
          file_id: number;
          name: string;
          summary: string | null;
          logo_url: string | null;
          authors: string[];
          download_count: number | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          modpack_id: string;
          project_id: number;
          file_id: number;
          name: string;
          summary?: string | null;
          logo_url?: string | null;
          authors?: string[];
          download_count?: number | null;
          added_at?: string;
        };
        Update: {
          file_id?: number;
          summary?: string | null;
          logo_url?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
