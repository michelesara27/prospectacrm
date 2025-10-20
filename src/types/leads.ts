// src/types/leads.ts

// Tipos para Status de Leads
export type LeadStatus =
  | "NENHUM"
  | "SEM RETORNO"
  | "SEM INTERESSE"
  | "TALVEZ"
  | "MEDIO INTERESSE"
  | "MUITO INTERESSADO"
  | "OCUPADO";

// Tipos para Canais de Contato
export type ContactChannel =
  | "facebook"
  | "whatsapp"
  | "instagram"
  | "pessoalmente"
  | "email"
  | "ligacao";

// Tipos para Tipo de Mensagem
export type MessageType = "primeiro contato" | "followup";

// Tipos para Direção da Mensagem
export type MessageDirection = "Enviada" | "Recebida";

// Interface principal do Lead
export interface Lead {
  id: number; // ← CORRIGIDO: number para compatibilidade com banco
  nome: string;
  email?: string;
  telefone: string;
  instagram?: string;
  decisor: string;
  endereco: string;
  cidade: string;
  estado: string;
  website?: string;
  id_produto?: number;
  id_product?: number;
  status: LeadStatus;
  active: "yes" | "no";
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Interface para criação de Lead (sem ID e timestamps)
export interface LeadCreate {
  nome: string;
  email?: string;
  telefone: string;
  instagram?: string;
  decisor: string;
  endereco: string;
  cidade: string;
  estado: string;
  website?: string;
  id_produto?: number;
  id_product?: number;
  status: LeadStatus;
  active: "yes" | "no";
  observacoes?: string;
}

// Interface para atualização de Lead (todos os campos opcionais)
export interface LeadUpdate {
  nome?: string;
  email?: string;
  telefone?: string;
  instagram?: string;
  decisor?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  website?: string;
  id_produto?: number;
  id_product?: number;
  status?: LeadStatus;
  active?: "yes" | "no";
  observacoes?: string;
}

// Interface para Mensagem
export interface Message {
  id: number;
  id_lead: number;
  mensagem_primeiro_contato: string;
  meio_de_contato: ContactChannel;
  tipo_mensagem: MessageType;
  identifica: MessageDirection;
  data_hora: string;
  created_at: string;
  updated_at: string;
}

// Interface para criação de Mensagem
export interface MessageCreate {
  id_lead: number;
  mensagem_primeiro_contato: string;
  meio_de_contato: ContactChannel;
  tipo_mensagem: MessageType;
  identifica: MessageDirection;
}

// Interface para atualização de Mensagem
export interface MessageUpdate {
  mensagem_primeiro_contato?: string;
  meio_de_contato?: ContactChannel;
  tipo_mensagem?: MessageType;
  identifica?: MessageDirection;
}

// Interface para Estatísticas de Leads
export interface LeadStats {
  total: number;
  semRetorno: number;
  semInteresse: number;
  talvez: number;
  medioInteresse: number;
  muitoInteressado: number;
}

// Interface para resposta de duplicatas
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  field?: "email" | "instagram" | "website";
  existingLead?: Lead;
}

// Interface para agrupamento de mensagens por lead
export interface LeadMessagesGroup {
  lead: {
    id: number;
    nome: string;
    instagram?: string;
    telefone?: string;
    email?: string;
  };
  messages: Message[];
}

// Interface para resposta de serviços
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

// Constantes para configuração de status
export const STATUS_CONFIG = {
  NENHUM: {
    label: "Nenhum",
    color: "bg-slate-500",
    textColor: "text-slate-500",
  },
  "SEM RETORNO": {
    label: "Sem Retorno",
    color: "bg-gray-500",
    textColor: "text-gray-500",
  },
  "SEM INTERESSE": {
    label: "Sem Interesse",
    color: "bg-red-500",
    textColor: "text-red-500",
  },
  TALVEZ: {
    label: "Talvez",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
  },
  "MEDIO INTERESSE": {
    label: "Médio Interesse",
    color: "bg-orange-500",
    textColor: "text-orange-500",
  },
  "MUITO INTERESSADO": {
    label: "Muito Interessado",
    color: "bg-green-500",
    textColor: "text-green-500",
  },
  OCUPADO: {
    label: "Ocupado",
    color: "bg-indigo-500",
    textColor: "text-indigo-500",
  },
} as const;

// Constantes para opções de formulário
export const ESTADOS_BRASILEIROS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
] as const;

export const LEAD_STATUS_OPTIONS = [
  { value: "NENHUM", label: "Nenhum" },
  { value: "SEM RETORNO", label: "Sem Retorno" },
  { value: "SEM INTERESSE", label: "Sem Interesse" },
  { value: "TALVEZ", label: "Talvez" },
  { value: "MEDIO INTERESSE", label: "Médio Interesse" },
  { value: "MUITO INTERESSADO", label: "Muito Interessado" },
  { value: "OCUPADO", label: "Ocupado" },
] as const;

export const ACTIVE_OPTIONS = [
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
] as const;

export const CONTACT_CHANNEL_OPTIONS = [
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "pessoalmente", label: "Pessoalmente" },
  { value: "email", label: "E-mail" },
  { value: "ligacao", label: "Ligação" },
] as const;

export const MESSAGE_TYPE_OPTIONS = [
  { value: "primeiro contato", label: "Primeiro contato" },
  { value: "followup", label: "Followup" },
] as const;

export const MESSAGE_DIRECTION_OPTIONS = [
  { value: "Enviada", label: "Enviada" },
  { value: "Recebida", label: "Recebida" },
] as const;

// Funções utilitárias
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
      7
    )}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
      6
    )}`;
  }

  return phone;
};

export const formatInstagram = (instagram: string): string => {
  const cleaned = instagram.trim();
  return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
};

export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

// Validações
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\(?\d{2}\)?\s?)?(\d{4,5})-?(\d{4})$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const isValidInstagram = (instagram: string): boolean => {
  const instagramRegex = /^@?[a-zA-Z0-9._]{1,30}$/;
  return instagramRegex.test(instagram);
};
