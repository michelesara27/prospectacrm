// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: number;
          nome: string;
          instagram: string | null;
          telefone: string;
          decisor: string;
          endereco: string;
          cidade: string;
          estado: string;
          website: string | null;
          email: string | null;
          id_produto: number | null;
          status:
            | "NENHUM"
            | "SEM RETORNO"
            | "SEM INTERESSE"
            | "TALVEZ"
            | "MEDIO INTERESSE"
            | "MUITO INTERESSADO";
          active: "yes" | "no";
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          nome: string;
          instagram?: string | null;
          telefone: string;
          decisor: string;
          endereco: string;
          cidade: string;
          estado: string;
          website?: string | null;
          email?: string | null;
          id_produto?: number | null;
          status?:
            | "NENHUM"
            | "SEM RETORNO"
            | "SEM INTERESSE"
            | "TALVEZ"
            | "MEDIO INTERESSE"
            | "MUITO INTERESSADO";
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          nome?: string;
          instagram?: string | null;
          telefone?: string;
          decisor?: string;
          endereco?: string;
          cidade?: string;
          estado?: string;
          website?: string | null;
          email?: string | null;
          id_produto?: number | null;
          status?:
            | "NENHUM"
            | "SEM RETORNO"
            | "SEM INTERESSE"
            | "TALVEZ"
            | "MEDIO INTERESSE"
            | "MUITO INTERESSADO";
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: number;
          id_lead: number;
          mensagem_primeiro_contato: string;
          meio_de_contato: string;
          tipo_mensagem: "primeiro contato" | "followup";
          identifica: "Enviada" | "Recebida";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          id_lead: number;
          mensagem_primeiro_contato: string;
          meio_de_contato: string;
          tipo_mensagem: "primeiro contato" | "followup";
          identifica?: "Enviada" | "Recebida";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          id_lead?: number;
          mensagem_primeiro_contato?: string;
          meio_de_contato?: string;
          tipo_mensagem?: "primeiro contato" | "followup";
          identifica?: "Enviada" | "Recebida";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];
