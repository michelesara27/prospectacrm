# UI: Páginas e Componentes

Descrição funcional da interface e componentes principais.

## Páginas

### Leads (`src/pages/Leads.tsx`)

- Lista de leads ativos com cartões exibindo nome, contato e o Produto/Serviço vinculado.
- Busca e filtros por status; estatísticas agregadas.
- Ações: criar, editar, inativar (exclusão lógica).
- Exibição do Produto/Serviço: prioriza `lead.id_product` e faz fallback para `lead.id_produto` para mostrar o nome do produto.

### Produtos (`src/pages/Products.tsx`)

- Administração de Produtos/Serviços: criar, editar, ativar/desativar.
- Estatísticas: total, ativos e inativos.

### Mensagens (`src/pages/Mensagens.tsx`)

- Listagem de mensagens por Lead, com agrupamento e ordenação.
- Criação e edição de mensagens, com campos: `mensagem_primeiro_contato`, `meio_de_contato`, `tipo_mensagem`, `identifica`.

## Componentes Principais

### NewLeadDialog (`src/components/NewLeadDialog.tsx`)

- Formulário de criação com validações Zod.
- Campo Produto/Serviço (`id_produto` no formulário) envia `id_product` para o serviço, garantindo compatibilidade.

### EditLeadDialog (`src/components/EditLeadDialog.tsx`)

- Formulário de edição com pré-seleção de Produto/Serviço baseada em `lead.id_product ?? lead.id_produto`.
- Ao atualizar, só envia `id_product` se o valor mudar; mantém lógica de fallback no serviço.

## Padrões de UI

- Baseado em `shadcn/ui` (Popover, Command, Dialog, Button, Input) e TailwindCSS.
- Formulários com `react-hook-form` e mensagens de erro amigáveis.
- Feedback visual de carregamento e erros (por hooks: `loading`, `error`).
