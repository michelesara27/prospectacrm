// src/services/messagesService.ts
import {
  supabase,
  type Message,
  type MessageInsert,
  type MessageUpdate,
} from "../lib/supabase";

export interface MessagesResponse {
  data: Message[] | null;
  error: string | null;
  count?: number;
}

export interface MessageResponse {
  data: Message | null;
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

class MessagesService {
  private cache = new CacheManager();

  // Criar nova mensagem
  async createMessage(
    messageData: Omit<MessageInsert, "id" | "created_at" | "updated_at">
  ): Promise<MessageResponse> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar mensagem:", error);
        return { data: null, error: error.message };
      }

      // Invalidar cache relacionado após criação bem-sucedida
      this.cache.invalidate("messages_lead");
      this.cache.invalidate("messages_page");

      return { data, error: null };
    } catch (error) {
      console.error("Erro inesperado ao criar mensagem:", error);
      return { data: null, error: "Erro inesperado ao criar mensagem" };
    }
  }

  // Buscar mensagens por lead com cache
  async getMessagesByLead(
    leadId: number,
    page = 1,
    limit = 20
  ): Promise<MessagesResponse> {
    const cacheKey = `messages_lead_${leadId}_page_${page}_limit_${limit}`;

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("messages")
        .select("*", { count: "exact" })
        .eq("id_lead", leadId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Erro ao buscar mensagens:", error);
        return { data: null, error: error.message };
      }

      const result = { data, error: null, count: count || 0 };

      // Cachear resultado por 3 minutos
      this.cache.set(cacheKey, result, 3);

      return result;
    } catch (error) {
      console.error("Erro inesperado ao buscar mensagens:", error);
      return { data: null, error: "Erro inesperado ao buscar mensagens" };
    }
  }

  // Buscar mensagem por ID
  async getMessageById(id: number): Promise<MessageResponse> {
    const cacheKey = `message_${id}`;

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar mensagem:", error);
        return { data: null, error: error.message };
      }

      const result = { data, error: null };

      // Cachear resultado por 5 minutos
      this.cache.set(cacheKey, result, 5);

      return result;
    } catch (error) {
      console.error("Erro inesperado ao buscar mensagem:", error);
      return { data: null, error: "Erro inesperado ao buscar mensagem" };
    }
  }

  // Atualizar mensagem
  async updateMessage(
    id: number,
    updates: MessageUpdate
  ): Promise<MessageResponse> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar mensagem:", error);
        return { data: null, error: error.message };
      }

      // Invalidar cache relacionado após atualização bem-sucedida
      this.cache.invalidate("messages_lead");
      this.cache.invalidate("messages_page");
      this.cache.invalidate(`message_${id}`);

      return { data, error: null };
    } catch (error) {
      console.error("Erro inesperado ao atualizar mensagem:", error);
      return { data: null, error: "Erro inesperado ao atualizar mensagem" };
    }
  }

  // Deletar mensagem
  async deleteMessage(id: number): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from("messages").delete().eq("id", id);

      if (error) {
        console.error("Erro ao deletar mensagem:", error);
        return { error: error.message };
      }

      // Invalidar cache relacionado após exclusão bem-sucedida
      this.cache.invalidate("messages_lead");
      this.cache.invalidate("messages_page");
      this.cache.invalidate(`message_${id}`);

      return { error: null };
    } catch (error) {
      console.error("Erro inesperado ao deletar mensagem:", error);
      return { error: "Erro inesperado ao deletar mensagem" };
    }
  }

  // Buscar todas as mensagens com paginação
  async getAllMessages(page = 1, limit = 50): Promise<MessagesResponse> {
    const cacheKey = `messages_page_${page}_limit_${limit}`;

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("messages")
        .select(
          `
          *,
          leads!inner(nome, email)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Erro ao buscar todas as mensagens:", error);
        return { data: null, error: error.message };
      }

      const result = { data, error: null, count: count || 0 };

      // Cachear resultado por 2 minutos
      this.cache.set(cacheKey, result, 2);

      return result;
    } catch (error) {
      console.error("Erro inesperado ao buscar todas as mensagens:", error);
      return {
        data: null,
        error: "Erro inesperado ao buscar todas as mensagens",
      };
    }
  }

  // Obter estatísticas das mensagens
  async getMessagesStats(): Promise<{
    total: number;
    enviadas: number;
    recebidas: number;
    primeiroContato: number;
    followup: number;
    error: string | null;
  }> {
    const cacheKey = "stats_messages";

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("identifica, tipo_mensagem");

      if (error) {
        console.error("Erro ao obter estatísticas das mensagens:", error);
        return {
          total: 0,
          enviadas: 0,
          recebidas: 0,
          primeiroContato: 0,
          followup: 0,
          error: error.message,
        };
      }

      const stats = {
        total: data?.length || 0,
        enviadas:
          data?.filter((msg) => msg.identifica === "Enviada").length || 0,
        recebidas:
          data?.filter((msg) => msg.identifica === "Recebida").length || 0,
        primeiroContato:
          data?.filter((msg) => msg.tipo_mensagem === "primeiro contato")
            .length || 0,
        followup:
          data?.filter((msg) => msg.tipo_mensagem === "followup").length || 0,
        error: null,
      };

      // Cachear estatísticas por 5 minutos
      this.cache.set(cacheKey, stats, 5);

      return stats;
    } catch (error) {
      console.error(
        "Erro inesperado ao obter estatísticas das mensagens:",
        error
      );
      return {
        total: 0,
        enviadas: 0,
        recebidas: 0,
        primeiroContato: 0,
        followup: 0,
        error: "Erro inesperado ao obter estatísticas das mensagens",
      };
    }
  }

  // Buscar mensagens agrupadas por lead com informações do lead
  async getMessagesGroupedByLead(): Promise<{
    data: Array<{
      lead: {
        id: number;
        nome: string;
        instagram?: string;
        telefone?: string;
        email?: string;
      };
      messages: Message[];
    }> | null;
    error: string | null;
  }> {
    const cacheKey = "messages_grouped_by_lead";

    // Verificar cache primeiro
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          leads!inner(
            id,
            nome,
            instagram,
            telefone,
            email
          )
        `
        )
        .order("data_hora", { ascending: false });

      if (error) {
        console.error("Erro ao buscar mensagens agrupadas:", error);
        return { data: null, error: error.message };
      }

      // Agrupar mensagens por lead
      const groupedMessages = new Map();

      data?.forEach((message: any) => {
        const leadId = message.leads.id;

        if (!groupedMessages.has(leadId)) {
          groupedMessages.set(leadId, {
            lead: {
              id: message.leads.id,
              nome: message.leads.nome,
              instagram: message.leads.instagram,
              phone: message.leads.phone,
              email: message.leads.email,
            },
            messages: [],
          });
        }

        groupedMessages.get(leadId).messages.push({
          id: message.id,
          id_lead: message.id_lead,
          mensagem_primeiro_contato: message.mensagem_primeiro_contato,
          meio_de_contato: message.meio_de_contato,
          tipo_mensagem: message.tipo_mensagem,
          identifica: message.identifica,
          data_hora: message.data_hora,
          created_at: message.created_at,
          updated_at: message.updated_at,
        });
      });

      // Converter Map para Array e ordenar mensagens de cada lead por data
      const result = Array.from(groupedMessages.values()).map((group) => ({
        ...group,
        messages: group.messages.sort(
          (a: any, b: any) =>
            new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
        ),
      }));

      const finalResult = { data: result, error: null };

      // Cachear resultado por 3 minutos
      this.cache.set(cacheKey, finalResult, 3);

      return finalResult;
    } catch (error) {
      console.error("Erro inesperado ao buscar mensagens agrupadas:", error);
      return {
        data: null,
        error: "Erro inesperado ao buscar mensagens agrupadas",
      };
    }
  }

  // Método para limpar todo o cache manualmente
  clearCache(): void {
    this.cache.invalidate();
  }
}

export const messagesService = new MessagesService();
