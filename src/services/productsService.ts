// src/services/productsService.ts
import { supabase } from "../lib/supabase";
import {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductStats,
} from "../types/products";

export interface ProductsResponse {
  data: Product[] | null;
  error: string | null;
  count?: number;
}

export interface ProductResponse {
  data: Product | null;
  error: string | null;
}

class ProductsService {
  // Buscar todos os produtos
  async getProducts(): Promise<ProductsResponse> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar produtos:", error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Erro inesperado ao buscar produtos:", error);
      return { data: null, error: "Erro inesperado ao buscar produtos" };
    }
  }

  // Buscar produto por ID
  async getProductById(id: number): Promise<ProductResponse> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar produto:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Erro inesperado ao buscar produto:", error);
      return { data: null, error: "Erro inesperado ao buscar produto" };
    }
  }

  // Criar novo produto
  async createProduct(productData: ProductCreate): Promise<ProductResponse> {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            nome: productData.nome,
            descricao_detalhada: productData.descricao_detalhada,
            prompt_consultivo: productData.prompt_consultivo,
            active: productData.active ?? true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar produto:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Erro inesperado ao criar produto:", error);
      return { data: null, error: "Erro inesperado ao criar produto" };
    }
  }

  // Atualizar produto
  async updateProduct(
    id: number,
    productData: ProductUpdate
  ): Promise<ProductResponse> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar produto:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Erro inesperado ao atualizar produto:", error);
      return { data: null, error: "Erro inesperado ao atualizar produto" };
    }
  }

  // Alternar status do produto (ativo/inativo)
  async toggleProductStatus(id: number): Promise<ProductResponse> {
    try {
      // Primeiro buscar o produto atual
      const { data: currentProduct, error: fetchError } =
        await this.getProductById(id);

      if (fetchError || !currentProduct) {
        return { data: null, error: fetchError || "Produto não encontrado" };
      }

      // Alternar o status
      const { data, error } = await supabase
        .from("products")
        .update({ active: !currentProduct.active })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao alternar status do produto:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Erro inesperado ao alternar status do produto:", error);
      return {
        data: null,
        error: "Erro inesperado ao alternar status do produto",
      };
    }
  }

  // Obter estatísticas dos produtos
  async getProductsStats(): Promise<ProductStats & { error: string | null }> {
    try {
      const { data, error } = await supabase.from("products").select("active");

      if (error) {
        console.error("Erro ao obter estatísticas:", error);
        return {
          total: 0,
          ativos: 0,
          inativos: 0,
          error: error.message,
        };
      }

      const stats: ProductStats = {
        total: data?.length || 0,
        ativos: data?.filter((product) => product.active).length || 0,
        inativos: data?.filter((product) => !product.active).length || 0,
      };

      return { ...stats, error: null };
    } catch (error) {
      console.error("Erro inesperado ao obter estatísticas:", error);
      return {
        total: 0,
        ativos: 0,
        inativos: 0,
        error: "Erro inesperado ao obter estatísticas",
      };
    }
  }
}

export const productsService = new ProductsService();
