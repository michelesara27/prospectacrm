# API de Services e Hooks

Este documento descreve os principais serviços (Supabase) e hooks de estado usados pela aplicação.

## Services

### `leadsService` (`src/services/leadsService.ts`)

- `getLeads(page?: number, limit?: number)` → `{ data: Lead[] | null, error, count }`
- `getLeadById(id: number)` → `{ data: Lead | null, error }`
- `checkDuplicates(email: string, instagram?: string, website?: string, excludeId?: number)` → `{ isDuplicate: boolean, field?, existingLead? }`
- `createLead(lead: LeadCreate)` → `{ data: Lead | null, error }`
  - Envia `id_product` quando presente; fallback automático para `id_produto` em caso de `PGRST204`.
- `updateLead(id: number, lead: LeadUpdate)` → `{ data: Lead | null, error }`
  - Atualiza apenas campos fornecidos; fallback de coluna para produto igual ao create.
- `deleteLead(id: number)` → `{ error }` (exclusão lógica: `active = 'no'`)
- `searchLeads(searchTerm: string)` → `{ data: Lead[] | null, error }` (filtra por vários campos com `ilike`)
- `getLeadsStats()` → `{ total, semRetorno, semInteresse, talvez, medioInteresse, muitoInteressado, error }`
- `getLeadsByStatus(status: string)` → `{ data: Lead[] | null, error }`
- `clearCache()` → `void`

### `productsService` (`src/services/productsService.ts`)

- `getProducts()` → `{ data: Product[] | null, error }`
- `getProductById(id: number)` → `{ data: Product | null, error }`
- `createProduct(product: ProductCreate)` → `{ data: Product | null, error }`
- `updateProduct(id: number, product: ProductUpdate)` → `{ data: Product | null, error }`
- `toggleProductStatus(id: number)` → `{ data: Product | null, error }`
- `getProductsStats()` → `{ total, ativos, inativos, error }`

### `messagesService` (`src/services/messagesService.ts`)

- `createMessage(messageData: Omit<MessageInsert, 'id' | 'created_at' | 'updated_at'>)` → `{ data: Message | null, error }`
- `getMessagesByLead(leadId: number, page?: number, limit?: number)` → `{ data: Message[] | null, error, count }`
- `getMessageById(id: number)` → `{ data: Message | null, error }`
- `updateMessage(id: number, updates: MessageUpdate)` → `{ data: Message | null, error }`
- `deleteMessage(id: number)` → `{ error }`
- `getAllMessages(page?: number, limit?: number)` → `{ data: Message[] | null, error, count }` (join em `leads`)
- `getMessagesStats()` → `{ total, enviadas, recebidas, primeiroContato, followup, error }`
- `getMessagesGroupedByLead()` → `{ data: Array<{ lead, messages }>|null, error }`
- `clearCache()` → `void`

## Hooks

### `useLeads()` (`src/hooks/useLeads.tsx`)

Retorna:

- Estado: `leads: Lead[]`, `loading: boolean`, `error: string | null`
- Ações: `addLead(LeadCreate)`, `updateLead(id, LeadUpdate)`, `deleteLead(id)`
- Duplicidade: `checkDuplicates(email, instagram?, website?, excludeId?)`
- Utilitários: `getStats()`, `refreshLeads()`, `clearError()`

Hooks derivados:

- `useLeadStats()` → contadores por status em tempo real nos leads carregados.
- `useLeadSearch(searchTerm)` → filtra localmente a lista de leads.
- `useLeadsByStatus(statusFilter)` → filtra a lista por status.

### `useProducts()` (`src/hooks/useProducts.tsx`)

- Estado: `products: Product[]`, `loading`, `error`, `stats: { total, ativos, inativos }`
- Ações: `addProduct(ProductCreate)`, `updateProduct(id, ProductUpdate)`, `toggleProductStatus(id)`
- Utilitários: `refreshProducts()`, `clearError()`

## Notas de Uso

- Sempre tratar `error` retornado pelos services antes de atualizar o estado local.
- Após operações CUD, os services invalidam caches relevantes; `refresh...` pode ser usado para garantir consistência.
- Ao vincular produto em Leads, prefira enviar `id_product`; o fallback cobre bases com `id_produto`.

## Tipos Principais

### Lead (`src/types/leads.ts`)

- `Lead`: `{ id: number, nome: string, email?: string, telefone: string, instagram?: string, decisor: string, endereco: string, cidade: string, estado: string, website?: string, id_produto?: number, id_product?: number, status: LeadStatus, active: 'yes' | 'no', observacoes?: string, created_at: string, updated_at: string }`
- `LeadCreate`: mesmos campos do `Lead` sem `id`, `created_at`, `updated_at` (todos obrigatórios/optionais conforme interface)
- `LeadUpdate`: todos os campos opcionais; usado para atualizações parciais
- `LeadStatus`: `'NENHUM' | 'SEM RETORNO' | 'SEM INTERESSE' | 'TALVEZ' | 'MEDIO INTERESSE' | 'MUITO INTERESSADO'`

### Product (`src/types/products.ts`)

- `Product`: `{ id: number, nome: string, descricao_detalhada: string, prompt_consultivo: string, active: boolean, created_at: string, updated_at: string }`
- `ProductCreate`: `{ nome: string, descricao_detalhada: string, prompt_consultivo: string, active?: boolean }`
- `ProductUpdate`: todos os campos opcionais
- `ProductStats`: `{ total: number, ativos: number, inativos: number }`

### Message (definido via Supabase typings)

- `Message`: `{ id: number, id_lead: number, mensagem_primeiro_contato: string, meio_de_contato: 'facebook' | 'whatsapp' | 'instagram' | 'pessoalmente' | 'e-mail', tipo_mensagem: 'primeiro contato' | 'followup', identifica: 'Enviada' | 'Recebida', data_hora: string, created_at: string, updated_at: string }`
- `MessageInsert` / `MessageUpdate`: versões para criação/atualização usadas em `messagesService`
