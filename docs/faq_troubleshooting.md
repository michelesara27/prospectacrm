# FAQ & Troubleshooting

Coletânea de problemas comuns e soluções rápidas.

## Variáveis de ambiente do Supabase ausentes

- Sintoma: erro ao inicializar o cliente ou chamadas falhando.
- Solução: verifique `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Consulte `docs/setup.md`.

## Coluna `id_product` inexistente (PGRST204)

- Sintoma: erro `PGRST204: Unknown column 'id_product'` ao criar/editar Lead.
- Comportamento: serviços fazem fallback automático para `id_produto` e, se também não existir, prosseguem sem vínculo de produto.
- Solução definitiva: garanta que sua tabela `leads` possua ao menos uma coluna de vínculo (`id_produto` ou `id_product`). Veja SQL em `docs/setup.md`.

## RLS bloqueando consultas

- Sintoma: erros de permissão ao selecionar/inserir.
- Solução: configure Row Level Security (policies) adequadas ou desative durante desenvolvimento. Veja notas em `docs/setup.md`.

## Erros de JSX/compilação

- Sintoma: falhas de build, mensagens de JSX não fechado ou tags desbalanceadas.
- Solução: revise componentes editados recentemente (ex.: `Leads.tsx`) e valide fechamento de tags.

## `net::ERR_ABORTED` ao carregar arquivo `.tsx` pela URL

- Sintoma: o navegador tenta acessar `http://localhost:808x/src/pages/AlgumArquivo.tsx`.
- Causa: essa URL não deve ser acessada diretamente; o bundler cuida das importações.
- Solução: recarregue a aplicação normalmente e verifique o terminal do dev server para erros de compilação.

## Produtos não aparecem na seleção

- Sintoma: combobox vazio em New/Edit Lead.
- Solução: confirme que há produtos ativos (`active = true`) criados em `Products`. Verifique erros em `useProducts`.

## Validações rejeitando dados

- Sintoma: mensagens de erro do formulário (Instagram/telefone/observações/status).
- Solução: siga os formatos válidos (ex.: Instagram `@usuario`), confirme limites e valores permitidos em `src/lib/validations.ts`.

## Inconsistência no campo `active`

- Sintoma: leads não listados.
- Causa: a aplicação lista apenas leads com `active = 'yes'`.
- Solução: verifique atualizações que tenham marcado `active = 'no'` (exclusão lógica) e ajuste se necessário.
