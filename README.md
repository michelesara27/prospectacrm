# ProspectaCRM — Documentação Completa

Sistema web para gestão de Leads, Produtos/Serviços e Mensagens, construído com Vite + React + TypeScript e Supabase.

## Visão Geral

- Cadastro e edição de Leads com validações (Zod) e busca por duplicidades.
- Vinculação de Produtos/Serviços aos Leads.
- Registro e consulta de Mensagens por Lead, com cache e invalidação automática.
- Estatísticas de Leads e Produtos, filtros e pesquisa.
- Arquitetura em camadas: UI (pages/components) → Hooks (estado) → Services (Supabase).

## Tecnologias

- React + TypeScript (Vite)
- Supabase (PostgREST + Auth + DB)
- react-hook-form + zod (validações)
- shadcn/ui + TailwindCSS (UI)

## Requisitos

- Node.js 18+ e npm
- Conta no Supabase (URL e ANON KEY)

## Setup Rápido

1) Instalar dependências:
```
npm install
```

2) Configurar variáveis de ambiente em `.env`:
```
VITE_SUPABASE_URL=<sua_url_do_supabase>
VITE_SUPABASE_ANON_KEY=<sua_anon_key_do_supabase>
```

3) Rodar em desenvolvimento:
```
npm run dev
```

4) Build de produção:
```
npm run build
npm run preview
```

## Estrutura do Projeto

- `src/pages/` — Páginas principais (Leads, Produtos, Mensagens)
- `src/components/` — Componentes reutilizáveis (dialogs, formulários, listas)
- `src/hooks/` — Hooks de estado e dados (leads, products, messages)
- `src/services/` — Camada de acesso ao Supabase (CRUD, cache, estatísticas)
- `src/lib/` — Configurações (Supabase client) e utilitários
- `src/types/` — Tipos e modelos (`Lead`, `Product` etc.)

Detalhes completos estão em `docs/architecture.md` e `docs/api.md`.

## Páginas

- Leads: cadastro/edição, busca, filtros, estatísticas e vínculo de produto.
- Produtos: criação/edição, ativação/desativação, estatísticas.
- Mensagens: registro, listagem por Lead e agrupamentos.

## Scripts

- `npm run dev` — ambiente de desenvolvimento (Vite)
- `npm run build` — build de produção
- `npm run preview` — pré-visualização do build
- `npm run lint` — lint/format (se configurado)

## Documentação Detalhada

- `docs/setup.md` — Passo a passo de instalação, ambiente e SQL das tabelas
- `docs/architecture.md` — Arquitetura, fluxo de dados e camadas do sistema
- `docs/api.md` — Interfaces dos serviços (Leads, Produtos, Mensagens) e hooks
- `docs/ui.md` — Páginas, componentes e comportamentos
- `docs/faq_troubleshooting.md` — Erros comuns e soluções
- `docs/changelog.md` — Histórico de versões e mudanças

## Contribuição

- Padronizar tipos em TypeScript e validações com Zod.
- Seguir a arquitetura em camadas e evitar acoplamento entre páginas e serviços.

## Problemas Comuns

- Variáveis do Supabase ausentes: confirmar `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Erros de compilação de JSX: verificar componentes e fechamento de tags.

## Problemas Comuns

https://youtu.be/gv0d9Q7Soc4

---

Este repositório está pronto para ser publicado no GitHub com a documentação completa e links para o diretório `docs/`.
