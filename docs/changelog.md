# Changelog

Todas as mudanças notáveis neste projeto.

## v0.1.0 — Documentação e Compatibilidade

- README atualizado com visão geral, setup e links para docs.
- Adicionados:
  - `docs/setup.md` (ambiente e SQL das tabelas)
  - `docs/architecture.md` (camadas, fluxo, cache e compatibilidade)
  - `docs/api.md` (services e hooks)
  - `docs/ui.md` (páginas e componentes)
  - `docs/faq_troubleshooting.md` (erros comuns)
- Compatibilidade no `leadsService` para aceitar `id_product` ou `id_produto` com fallback.
- UI de Leads exibe nome do Produto/Serviço com prioridade para `id_product` e fallback.
- Edit Lead: pré-seleção automática do Produto/Serviço com base na ligação existente.
- Correção de JSX em `Leads.tsx` (tag extra removida).
