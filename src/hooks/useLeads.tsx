// src/hooks/useLeads.tsx
import { useState, useEffect } from "react";
import { leadsService } from "@/services/leadsService";
import {
  Lead,
  LeadCreate,
  LeadUpdate,
  LeadStats,
  DuplicateCheckResult,
} from "@/types/leads";

export interface UseLeadsReturn {
  // Estado
  leads: Lead[];
  loading: boolean;
  error: string | null;

  // Ações
  addLead: (lead: LeadCreate) => Promise<boolean>;
  updateLead: (id: number, lead: LeadUpdate) => Promise<boolean>;
  deleteLead: (id: number) => Promise<boolean>;
  checkDuplicates: (
    email: string,
    instagram?: string,
    website?: string,
    excludeId?: number
  ) => Promise<DuplicateCheckResult>;

  // Utilitários
  getStats: () => LeadStats;
  refreshLeads: () => Promise<void>;
  clearError: () => void;
}

export const useLeads = (): UseLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar leads inicialmente
  const refreshLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await leadsService.getLeads();

      if (fetchError) {
        throw new Error(fetchError);
      }

      setLeads(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar leads";

      setError(errorMessage);
      console.error("Erro ao carregar leads:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar leads no mount
  useEffect(() => {
    refreshLeads();
  }, []);

  // Adicionar novo lead
  const addLead = async (leadData: LeadCreate): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: createError } = await leadsService.createLead(
        leadData
      );

      if (createError) {
        throw new Error(createError);
      }

      if (data) {
        setLeads((prev) => [data, ...prev]);
        return true;
      }

      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar lead";

      setError(errorMessage);
      console.error("Erro ao criar lead:", err);
      return false;
    }
  };

  // Atualizar lead existente
  const updateLead = async (
    id: number,
    leadData: LeadUpdate
  ): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: updateError } = await leadsService.updateLead(
        id,
        leadData
      );

      if (updateError) {
        throw new Error(updateError);
      }

      if (data) {
        setLeads((prev) => prev.map((lead) => (lead.id === id ? data : lead)));
        return true;
      }

      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar lead";

      setError(errorMessage);
      console.error("Erro ao atualizar lead:", err);
      return false;
    }
  };

  // Deletar lead (inativação lógica)
  const deleteLead = async (id: number): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await leadsService.deleteLead(id);

      if (deleteError) {
        throw new Error(deleteError);
      }

      // Atualizar estado local - remover lead da lista
      setLeads((prev) => prev.filter((lead) => lead.id !== id));

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao excluir lead";

      setError(errorMessage);
      console.error("Erro ao excluir lead:", err);
      return false;
    }
  };

  // Verificar duplicatas
  const checkDuplicates = async (
    email: string,
    instagram?: string,
    website?: string,
    excludeId?: number
  ): Promise<DuplicateCheckResult> => {
    try {
      setError(null);

      const { data, error: checkError } = await leadsService.checkDuplicates(
        email,
        instagram,
        website,
        excludeId
      );

      if (checkError) {
        throw new Error(checkError);
      }

      return data || { isDuplicate: false };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao verificar duplicatas";

      setError(errorMessage);
      console.error("Erro ao verificar duplicatas:", err);
      return { isDuplicate: false };
    }
  };

  // Obter estatísticas dos leads
  const getStats = (): LeadStats => {
    const stats: LeadStats = {
      total: leads.length,
      semRetorno: 0,
      semInteresse: 0,
      talvez: 0,
      medioInteresse: 0,
      muitoInteressado: 0,
    };

    leads.forEach((lead) => {
      switch (lead.status) {
        case "SEM RETORNO":
          stats.semRetorno++;
          break;
        case "SEM INTERESSE":
          stats.semInteresse++;
          break;
        case "TALVEZ":
          stats.talvez++;
          break;
        case "MEDIO INTERESSE":
          stats.medioInteresse++;
          break;
        case "MUITO INTERESSADO":
          stats.muitoInteressado++;
          break;
      }
    });

    return stats;
  };

  // Limpar erro
  const clearError = () => {
    setError(null);
  };

  return {
    // Estado
    leads,
    loading,
    error,

    // Ações
    addLead,
    updateLead,
    deleteLead,
    checkDuplicates,

    // Utilitários
    getStats,
    refreshLeads,
    clearError,
  };
};

// Hook derivado para estatísticas em tempo real
export const useLeadStats = () => {
  const { leads } = useLeads();

  return {
    total: leads.length,
    semRetorno: leads.filter((lead) => lead.status === "SEM RETORNO").length,
    semInteresse: leads.filter((lead) => lead.status === "SEM INTERESSE")
      .length,
    talvez: leads.filter((lead) => lead.status === "TALVEZ").length,
    medioInteresse: leads.filter((lead) => lead.status === "MEDIO INTERESSE")
      .length,
    muitoInteressado: leads.filter(
      (lead) => lead.status === "MUITO INTERESSADO"
    ).length,
  };
};

// Hook para busca de leads
export const useLeadSearch = (searchTerm: string = "") => {
  const { leads, loading } = useLeads();

  const filteredLeads = leads.filter((lead) => {
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();

    return (
      lead.nome.toLowerCase().includes(term) ||
      (lead.email && lead.email.toLowerCase().includes(term)) ||
      (lead.instagram && lead.instagram.toLowerCase().includes(term)) ||
      lead.telefone.includes(searchTerm) ||
      lead.decisor.toLowerCase().includes(term) ||
      lead.cidade.toLowerCase().includes(term) ||
      (lead.observacoes && lead.observacoes.toLowerCase().includes(term))
    );
  });

  return {
    leads: filteredLeads,
    loading,
    totalCount: leads.length,
    filteredCount: filteredLeads.length,
  };
};

// Hook para filtro por status
export const useLeadsByStatus = (statusFilter: string = "all") => {
  const { leads, loading } = useLeads();

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter === "all") return true;
    return lead.status === statusFilter;
  });

  return {
    leads: filteredLeads,
    loading,
    totalCount: leads.length,
    filteredCount: filteredLeads.length,
  };
};
