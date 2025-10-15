// src/types/products.ts
export interface Product {
  id: number;
  nome: string;
  descricao_detalhada: string;
  prompt_consultivo: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  nome: string;
  descricao_detalhada: string;
  prompt_consultivo: string;
  active?: boolean;
}

export interface ProductUpdate {
  nome?: string;
  descricao_detalhada?: string;
  prompt_consultivo?: string;
  active?: boolean;
}

export interface ProductStats {
  total: number;
  ativos: number;
  inativos: number;
}
