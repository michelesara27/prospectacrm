// src/lib/validations.ts
import { z } from "zod";

// Lista de estados brasileiros
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
];

// Status disponíveis para leads
export const LEAD_STATUS = [
  { value: "NENHUM", label: "Nenhum" },
  { value: "SEM RETORNO", label: "Sem Retorno" },
  { value: "SEM INTERESSE", label: "Sem Interesse" },
  { value: "TALVEZ", label: "Talvez" },
  { value: "MEDIO INTERESSE", label: "Médio Interesse" },
  { value: "MUITO INTERESSADO", label: "Muito Interessado" },
  { value: "OCUPADO", label: "Ocupado" },
] as const;

// Opções para o campo active
export const ACTIVE_OPTIONS = [
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
] as const;

// Regex para validação de telefone brasileiro
const PHONE_REGEX = /^(\(?\d{2}\)?\s?)?(\d{4,5})-?(\d{4})$/;

// Regex para validação de Instagram (com ou sem @)
const INSTAGRAM_REGEX = /^@?[a-zA-Z0-9._]{1,30}$/;

// Schema de validação para o formulário de lead
export const leadFormSchema = z.object({
  name: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  instagram: z
    .string()
    .min(1, "Instagram é obrigatório")
    .max(120, "Instagram deve ter no máximo 120 caracteres")
    .regex(
      INSTAGRAM_REGEX,
      "Formato de Instagram inválido (ex: @usuario ou usuario)"
    )
    .transform((val) => (val.startsWith("@") ? val : `@${val}`)),

  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  decisor: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  endereco: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  cidade: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  estado: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  website: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),

  // Campo obrigatório para vincular o produto/serviço
  id_produto: z
    .number({ invalid_type_error: "Produto/Serviço é obrigatório" })
    .int()
    .refine((val) => val > 0, {
      message: "Produto/Serviço é obrigatório",
    }),

  status: z
    .enum([
      "NENHUM",
      "SEM RETORNO",
      "SEM INTERESSE",
      "TALVEZ",
      "MEDIO INTERESSE",
      "MUITO INTERESSADO",
      "OCUPADO",
    ])
    .optional(),

  active: z.enum(["yes", "no"]).default("yes"),

  observacoes: z
    .string()
    .max(1000, "Observações devem ter no máximo 1000 caracteres")
    .optional(),
});

// Tipo inferido do schema
export type LeadFormData = z.infer<typeof leadFormSchema>;

// Schema para validação de duplicidade
export const duplicateCheckSchema = z.object({
  email: z.string().email(),
  instagram: z.string().min(1),
  website: z.string().url(),
});

// Função para validar duplicidade
export const validateDuplicates = (
  data: LeadFormData,
  checkDuplicates: (
    field: "email" | "instagram" | "website",
    value: string,
    excludeId?: string
  ) => boolean,
  excludeId?: string
) => {
  const errors: string[] = [];

  if (checkDuplicates("email", data.email, excludeId)) {
    errors.push("Este e-mail já está cadastrado");
  }

  if (checkDuplicates("instagram", data.instagram, excludeId)) {
    errors.push("Este Instagram já está cadastrado");
  }

  if (checkDuplicates("website", data.website, excludeId)) {
    errors.push("Este website já está cadastrado");
  }

  return errors;
};

// Função para formatar telefone
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

// Função para formatar Instagram
export const formatInstagram = (instagram: string): string => {
  const cleaned = instagram.trim();
  return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
};

// Função para normalizar URL
export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
};
