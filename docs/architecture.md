# Arquitetura e Fluxo de Dados

Este documento detalha a arquitetura do ProspectaCRM, cobrindo camadas, fluxo de dados, compatibilidade de schema e estratégias de cache/validação.

## Camadas

- Pages (`src/pages/`): telas principais (Leads, Products, Mensagens) e lógica de interação de alto nível.
- Components (`src/components/`): dialogs, formulários, listas, botões e comboboxes (shadcn/ui).
- Hooks (`src/hooks/`): gestão de estado e integração com services; expõem operações como `addLead`, `updateLead`, `refreshLeads`, `useProducts`, etc.
- Services (`src/services/`): acesso ao Supabase, CRUD, paginação e estatísticas, com pequenos caches em memória e tratamento de erros.
- Lib/Types (`src/lib/`, `src/types/`): cliente Supabase, validações (Zod) e modelos (`Lead`, `Product`, `Message`).

## Fluxo de Dados (Exemplo: Leads)

1. UI dispara ações via hooks (`useLeads.tsx`).
2. Hooks chamam métodos dos services (`leadsService`).
3. Services executam queries no Supabase, aplicando cache e invalidação quando necessário.
4. Respostas populam o estado local (hooks), que atualiza a UI.

## Validações e Normalização

- `react-hook-form` + `zod` para validar dados do Lead (Instagram, telefone, status, ativo, observações, etc.).
- Utilitários: formatação de telefone/Instagram e normalização de URLs.

## Cache em Memória

- Services usam um `CacheManager` simples com TTL para evitar chamadas repetidas.
- Invalidação automática após operações de criação/atualização/exclusão.
- Escopos de cache: listagens paginadas, estatísticas, buscas e grupamentos de mensagens.

## Mensagens e Agrupamento

- `messagesService` fornece criação, listagem por Lead, atualização, exclusão, estatísticas e agrupamento por Lead com join em `leads`.
- Resultados paginados e ordenados por `created_at` ou `data_hora`.

## Estatísticas

- Leads: contagens por `status` com `active = 'yes'`.
- Produtos: total/ativos/inativos baseados em `active` (boolean).
- Mensagens: totais por `identifica` (Enviada/Recebida) e por `tipo_mensagem` (primeiro contato/followup).

## Tratamento de Erros

- Logs no console com mensagens claras.
- Fallback de colunas (PGRST204) para compatibilidade de schema.
- Retorno de mensagens amigáveis para duplicidade de Leads.

## Performance

- Índices recomendados nas tabelas para filtros e ordenações.
- Limites de página e range para listagens.
- Cache com TTL pequeno e invalidação agressiva após CUD.