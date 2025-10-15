// src/services/leadsService.ts
import { supabase } from "../lib/supabase";
import {
  Lead,
  LeadCreate,
  LeadUpdate,
  LeadStats,
  DuplicateCheckResult,
} from "../types/leads";

export interface LeadsResponse {
  data: Lead[] | null;
  error: string | null;
  count?: number;
}

export interface LeadResponse {
  data: Lead | null;
  error: string | null;
}

// Cache simples para otimização
class CacheManager {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set(key: string, data: any, ttlMinutes: number = 5): void {
    const ttl = ttlMinutes * 60 * 1000; // Converter para millisegundos
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  invalidate(keyPattern?: string): void {
    if (!keyPattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }
}

class LeadsService {
  private cache = new CacheManager();

  // Buscar todos os leads com paginação (apenas ativos)
  async getLeads(page: number = 1, limit: number = 50): Promise<LeadsResponse> {
    const cacheKey = `leads_page_${page}_limit_${limit}`;

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("leads")
        .select("*", { count: "exact" })
        .eq("active", "yes")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Erro ao buscar leads:", error);
        return { data: null, error: error.message };
      }

      const result = {
        data: data || [],
        error: null,
        count: count || 0,
      };

      // Cache por 2 minutos
      this.cache.set(cacheKey, result, 2);

      return result;
    } catch (error) {
      console.error("Erro inesperado ao buscar leads:", error);
      return {
        data: null,
        error: "Erro inesperado ao buscar leads",
      };
    }
  }

  // Buscar lead por ID
  async getLeadById(id: number): Promise<LeadResponse> {
    const cacheKey = `lead_${id}`;

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar lead:", error);
        return { data: null, error: error.message };
      }

      const result = { data, error: null };

      // Cache por 5 minutos
      this.cache.set(cacheKey, result, 5);

      return result;
    } catch (error) {
      console.error("Erro inesperado ao buscar lead:", error);
      return {
        data: null,
        error: "Erro inesperado ao buscar lead",
      };
    }
  }

  // Verificar duplicatas
  async checkDuplicates(
    email: string,
    instagram?: string,
    website?: string,
    excludeId?: number
  ): Promise<DuplicateCheckResult> {
    // Se todos os campos estão vazios, não há duplicatas para verificar
    const trimmedEmail = email?.trim() || "";
    const trimmedInstagram = instagram?.trim() || "";
    const trimmedWebsite = website?.trim() || "";

    if (!trimmedEmail && !trimmedInstagram && !trimmedWebsite) {
      return { isDuplicate: false };
    }

    const cacheKey = `duplicates_${trimmedEmail}_${trimmedInstagram}_${trimmedWebsite}_${
      excludeId || ""
    }`;

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      let query = supabase.from("leads").select("*").eq("active", "yes");

      // Construir condições OR para verificar duplicatas
      const conditions: string[] = [];

      if (trimmedEmail) {
        conditions.push(`email.eq.${trimmedEmail}`);
      }

      if (trimmedInstagram) {
        conditions.push(`instagram.eq.${trimmedInstagram}`);
      }

      if (trimmedWebsite) {
        conditions.push(`website.eq.${trimmedWebsite}`);
      }

      // Se não há condições, não há duplicatas
      if (conditions.length === 0) {
        return { isDuplicate: false };
      }

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      // Usar OR para verificar todos os campos de uma vez
      const { data: duplicates, error } = await query.or(conditions.join(","));

      if (error) {
        console.error("Erro ao verificar duplicatas:", error);
        return { isDuplicate: false };
      }

      if (duplicates && duplicates.length > 0) {
        const duplicate = duplicates[0];
        let field: "email" | "instagram" | "website" = "email";

        // Determinar qual campo é duplicado
        if (trimmedEmail && duplicate.email === trimmedEmail) {
          field = "email";
        } else if (
          trimmedInstagram &&
          duplicate.instagram === trimmedInstagram
        ) {
          field = "instagram";
        } else if (trimmedWebsite && duplicate.website === trimmedWebsite) {
          field = "website";
        }

        const result = {
          isDuplicate: true,
          field,
          existingLead: duplicate,
        };

        // Cache por 1 minuto (dados podem mudar rapidamente)
        this.cache.set(cacheKey, result, 1);

        return result;
      }

      const result = { isDuplicate: false };
      this.cache.set(cacheKey, result, 1);

      return result;
    } catch (error) {
      console.error("Erro inesperado ao verificar duplicatas:", error);
      return { isDuplicate: false };
    }
  }

  // Criar novo lead
  async createLead(leadData: LeadCreate): Promise<LeadResponse> {
    try {
      // Verificar duplicatas antes de criar
      const duplicateCheck = await this.checkDuplicates(
        leadData.email || "",
        leadData.instagram,
        leadData.website
      );

      if (duplicateCheck.isDuplicate) {
        return {
          data: null,
          error: `Já existe um lead com este ${duplicateCheck.field}: ${duplicateCheck.existingLead?.nome}`,
        };
      }

      // Montar payload base (sem id_produto)
      const insertBase: any = {
        nome: leadData.nome,
        email: leadData.email || null,
        telefone: leadData.telefone,
        instagram: leadData.instagram || null,
        decisor: leadData.decisor,
        endereco: leadData.endereco,
        cidade: leadData.cidade,
        estado: leadData.estado,
        website: leadData.website || null,
        status: leadData.status,
        active: leadData.active,
        observacoes: leadData.observacoes || null,
      };

      // Incluir produto se fornecido (suportar id_product ou id_produto)
      const productId =
        (leadData as any).id_product !== undefined
          ? (leadData as any).id_product
          : (leadData as any).id_produto !== undefined
          ? (leadData as any).id_produto
          : undefined;

      const insertWithProduct =
        productId !== undefined
          ? { ...insertBase, id_product: productId ?? null }
          : insertBase;

      let { data, error } = await supabase
        .from("leads")
        .insert([insertWithProduct])
        .select()
        .single();

      // Fallbacks: tentar com id_produto se id_product não existir; por fim tentar sem campo
      if (error && error.code === "PGRST204" && error.message?.includes("id_product")) {
        console.warn(
          "Coluna 'id_product' não encontrada. Tentando inserir usando 'id_produto'."
        );

        const retryWithPt = await supabase
          .from("leads")
          .insert([
            productId !== undefined
              ? { ...insertBase, id_produto: productId ?? null }
              : insertBase,
          ])
          .select()
          .single();

        data = retryWithPt.data as any;
        error = retryWithPt.error as any;

        if (error && error.code === "PGRST204" && error.message?.includes("id_produto")) {
          console.warn(
            "Colunas 'id_product' e 'id_produto' não encontradas. Inserindo sem associação de produto."
          );

          const retryBase = await supabase
            .from("leads")
            .insert([insertBase])
            .select()
            .single();

          data = retryBase.data as any;
          error = retryBase.error as any;
        }
      }

      if (error) {
        console.error("Erro ao criar lead:", error);
        return { data: null, error: error.message };
      }

      // Invalidar cache relacionado
      this.cache.invalidate("leads_page");
      this.cache.invalidate("duplicates");
      this.cache.invalidate("stats");
      this.cache.invalidate("search");

      return { data, error: null };
    } catch (error) {
      console.error("Erro inesperado ao criar lead:", error);
      return {
        data: null,
        error: "Erro inesperado ao criar lead",
      };
    }
  }

  // Atualizar lead existente
  async updateLead(id: number, leadData: LeadUpdate): Promise<LeadResponse> {
    try {
      // Verificar duplicatas antes de atualizar (excluindo o próprio lead)
      if (leadData.email || leadData.instagram || leadData.website) {
        const duplicateCheck = await this.checkDuplicates(
          leadData.email || "",
          leadData.instagram,
          leadData.website,
          id
        );

        if (duplicateCheck.isDuplicate) {
          return {
            data: null,
            error: `Já existe um lead com este ${duplicateCheck.field}: ${duplicateCheck.existingLead?.nome}`,
          };
        }
      }

      const updateDataBase: any = {};

      // Mapear campos apenas se foram fornecidos
      if (leadData.nome !== undefined) updateDataBase.nome = leadData.nome;
      if (leadData.email !== undefined)
        updateDataBase.email = leadData.email || null;
      if (leadData.telefone !== undefined)
        updateDataBase.telefone = leadData.telefone;
      if (leadData.instagram !== undefined)
        updateDataBase.instagram = leadData.instagram || null;
      if (leadData.decisor !== undefined) updateDataBase.decisor = leadData.decisor;
      if (leadData.endereco !== undefined)
        updateDataBase.endereco = leadData.endereco;
      if (leadData.cidade !== undefined) updateDataBase.cidade = leadData.cidade;
      if (leadData.estado !== undefined) updateDataBase.estado = leadData.estado;
      if (leadData.website !== undefined)
        updateDataBase.website = leadData.website || null;
      if (leadData.status !== undefined) updateDataBase.status = leadData.status;
      if (leadData.active !== undefined) updateDataBase.active = leadData.active;
      if (leadData.observacoes !== undefined)
        updateDataBase.observacoes = leadData.observacoes || null;

      // Suportar id_product ou id_produto
      const updateProductId =
        (leadData as any).id_product !== undefined
          ? (leadData as any).id_product
          : (leadData as any).id_produto !== undefined
          ? (leadData as any).id_produto
          : undefined;

      const updateData =
        updateProductId !== undefined
          ? { ...updateDataBase, id_product: updateProductId ?? null }
          : updateDataBase;

      let { data, error } = await supabase
        .from("leads")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      // Fallbacks: tentar com id_produto se id_product não existir; por fim sem o campo
      if (error && error.code === "PGRST204" && error.message?.includes("id_product")) {
        console.warn(
          "Coluna 'id_product' não encontrada. Tentando atualizar usando 'id_produto'."
        );

        const { id_product, ...rest } = updateData;
        const retryWithPt = await supabase
          .from("leads")
          .update(
            updateProductId !== undefined
              ? { ...rest, id_produto: updateProductId ?? null }
              : rest
          )
          .eq("id", id)
          .select()
          .single();

        data = retryWithPt.data as any;
        error = retryWithPt.error as any;

        if (error && error.code === "PGRST204" && error.message?.includes("id_produto")) {
          console.warn(
            "Colunas 'id_product' e 'id_produto' não encontradas. Atualizando sem o campo de produto."
          );

          const retryBase = await supabase
            .from("leads")
            .update(rest)
            .eq("id", id)
            .select()
            .single();

          data = retryBase.data as any;
          error = retryBase.error as any;
        }
      }

      if (error) {
        console.error("Erro ao atualizar lead:", error);
        return { data: null, error: error.message };
      }

      // Invalidar cache relacionado
      this.cache.invalidate("leads_page");
      this.cache.invalidate(`lead_${id}`);
      this.cache.invalidate("duplicates");
      this.cache.invalidate("stats");
      this.cache.invalidate("search");

      return { data, error: null };
    } catch (error) {
      console.error("Erro inesperado ao atualizar lead:", error);
      return {
        data: null,
        error: "Erro inesperado ao atualizar lead",
      };
    }
  }

  // Deletar lead (exclusão lógica)
  async deleteLead(id: number): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ active: "no" })
        .eq("id", id);

      if (error) {
        console.error("Erro ao inativar lead:", error);
        return { error: error.message };
      }

      // Invalidar cache relacionado
      this.cache.invalidate("leads_page");
      this.cache.invalidate(`lead_${id}`);
      this.cache.invalidate("duplicates");
      this.cache.invalidate("stats");
      this.cache.invalidate("search");

      return { error: null };
    } catch (error) {
      console.error("Erro inesperado ao inativar lead:", error);
      return {
        error: "Erro inesperado ao inativar lead",
      };
    }
  }

  // Buscar leads com filtros
  async searchLeads(searchTerm: string): Promise<LeadsResponse> {
    const cacheKey = `search_${searchTerm.toLowerCase().trim()}`;

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("active", "yes")
        .or(
          `nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%,instagram.ilike.%${searchTerm}%,decisor.ilike.%${searchTerm}%,cidade.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false })
        .limit(50); // Limite para performance

      if (error) {
        console.error("Erro ao buscar leads:", error);
        return { data: null, error: error.message };
      }

      const result = { data: data || [], error: null };

      // Cache por 3 minutos
      this.cache.set(cacheKey, result, 3);

      return result;
    } catch (error) {
      console.error("Erro inesperado ao buscar leads:", error);
      return {
        data: null,
        error: "Erro inesperado ao buscar leads",
      };
    }
  }

  // Obter estatísticas dos leads
  async getLeadsStats(): Promise<LeadStats & { error: string | null }> {
    const cacheKey = "stats_leads";

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const { data, error } = await supabase
        .from("leads")
        .select("status")
        .eq("active", "yes");

      if (error) {
        console.error("Erro ao obter estatísticas:", error);
        return {
          total: 0,
          semRetorno: 0,
          semInteresse: 0,
          talvez: 0,
          medioInteresse: 0,
          muitoInteressado: 0,
          error: error.message,
        };
      }

      const stats: LeadStats = {
        total: data?.length || 0,
        semRetorno:
          data?.filter((lead) => lead.status === "SEM RETORNO").length || 0,
        semInteresse:
          data?.filter((lead) => lead.status === "SEM INTERESSE").length || 0,
        talvez: data?.filter((lead) => lead.status === "TALVEZ").length || 0,
        medioInteresse:
          data?.filter((lead) => lead.status === "MEDIO INTERESSE").length || 0,
        muitoInteressado:
          data?.filter((lead) => lead.status === "MUITO INTERESSADO").length ||
          0,
      };

      const result = { ...stats, error: null };

      // Cache por 5 minutos
      this.cache.set(cacheKey, result, 5);

      return result;
    } catch (error) {
      console.error("Erro inesperado ao obter estatísticas:", error);
      return {
        total: 0,
        semRetorno: 0,
        semInteresse: 0,
        talvez: 0,
        medioInteresse: 0,
        muitoInteressado: 0,
        error: "Erro inesperado ao obter estatísticas",
      };
    }
  }

  // Buscar leads por status específico
  async getLeadsByStatus(status: string): Promise<LeadsResponse> {
    const cacheKey = `leads_status_${status}`;

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("active", "yes")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar leads por status:", error);
        return { data: null, error: error.message };
      }

      const result = { data: data || [], error: null };

      // Cache por 3 minutos
      this.cache.set(cacheKey, result, 3);

      return result;
    } catch (error) {
      console.error("Erro inesperado ao buscar leads por status:", error);
      return {
        data: null,
        error: "Erro inesperado ao buscar leads por status",
      };
    }
  }

  // Método para limpar cache manualmente
  clearCache(): void {
    this.cache.invalidate();
  }
}

export const leadsService = new LeadsService();
