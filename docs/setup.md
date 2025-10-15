# Setup e Configuração

Guia passo a passo para preparar ambiente, banco de dados no Supabase e executar o projeto localmente.

## Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```
VITE_SUPABASE_URL=<sua_url_do_supabase>
VITE_SUPABASE_ANON_KEY=<sua_anon_key_do_supabase>
```

Esses valores estão disponíveis no painel do seu projeto Supabase em Settings → API.

## Banco de Dados (Supabase)

O sistema trabalha com três tabelas principais: `leads`, `products` e `messages`.

### Tabela `products`

```sql
create table if not exists public.products (
  id bigserial primary key,
  nome text not null,
  descricao_detalhada text not null,
  prompt_consultivo text not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_active on public.products(active);
create index if not exists idx_products_created_at on public.products(created_at desc);
```

### Tabela `leads`

Por compatibilidade, o sistema suporta tanto `id_produto` quanto `id_product`. Se sua base usa o nome em português, crie `id_produto`.

```sql
create table if not exists public.leads (
  id bigserial primary key,
  nome text not null,
  instagram text null,
  telefone text not null,
  decisor text not null,
  endereco text not null,
  cidade text not null,
  estado text not null,
  website text null,
  email text null,
  -- use apenas UM destes, conforme sua base
  id_produto bigint null references public.products(id),
  -- id_product bigint null references public.products(id),
  status text not null,
  active text not null default 'yes',
  observacoes text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_leads_active on public.leads(active);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created_at on public.leads(created_at desc);
```

Opcionalmente, adicione uma restrição para `status` conforme os valores da aplicação:

```sql
alter table public.leads
  add constraint leads_status_check
  check (status in (
    'NENHUM',
    'SEM RETORNO',
    'SEM INTERESSE',
    'TALVEZ',
    'MEDIO INTERESSE',
    'MUITO INTERESSADO'
  ));
```

### Tabela `messages`

```sql
create table if not exists public.messages (
  id bigserial primary key,
  id_lead bigint not null references public.leads(id) on delete cascade,
  mensagem_primeiro_contato text not null,
  meio_de_contato text not null,
  tipo_mensagem text not null,
  identifica text not null,
  data_hora timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_messages_lead on public.messages(id_lead);
create index if not exists idx_messages_created_at on public.messages(created_at desc);
```

### Observações de Segurança (RLS)

- Em ambientes públicos, use Row Level Security (RLS) e policies adequadas.
- Para desenvolvimento simples, você pode manter RLS desativado temporariamente.

## Executando Localmente

1) Instalar dependências:
```
npm install
```

2) Rodar o servidor de desenvolvimento:
```
npm run dev
```

3) Build e preview de produção:
```
npm run build
npm run preview
```

## Dicas

- Mantenha os índices para performance de listagens e buscas.
- Atualize as policies do Supabase conforme seu modelo de acesso e autenticação.


## SQL completo
CREATE TABLE public.leads (
  id integer NOT NULL DEFAULT nextval('leads_id_seq'::regclass),
  data_hora timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nome character varying NOT NULL,
  email character varying,
  telefone character varying NOT NULL,
  decisor character varying NOT NULL,
  endereco character varying NOT NULL,
  cidade character varying NOT NULL,
  estado character NOT NULL,
  instagram character varying,
  website character varying,
  status character varying NOT NULL DEFAULT 'SEM RETORNO'::character varying CHECK (status::text = ANY (ARRAY['NENHUM'::character varying, 'SEM RETORNO'::character varying, 'SEM INTERESSE'::character varying, 'TALVEZ'::character varying, 'MEDIO INTERESSE'::character varying, 'MUITO INTERESSADO'::character varying]::text[])),
  observacoes text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  active text NOT NULL DEFAULT 'yes'::text,
  CONSTRAINT leads_pkey PRIMARY KEY (id)
);

CREATE TABLE public.messages (
  id integer NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
  data_hora timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_lead integer NOT NULL,
  mensagem_primeiro_contato text,
  meio_de_contato character varying NOT NULL CHECK (meio_de_contato::text = ANY (ARRAY['facebook'::character varying, 'whatsapp'::character varying, 'instagram'::character varying, 'pessoalmente'::character varying, 'e-mail'::character varying]::text[])),
  tipo_mensagem character varying NOT NULL CHECK (tipo_mensagem::text = ANY (ARRAY['primeiro contato'::character varying, 'followup'::character varying]::text[])),
  identifica character varying NOT NULL DEFAULT 'Enviada'::character varying CHECK (identifica::text = ANY (ARRAY['Enviada'::character varying, 'Recebida'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT fk_messages_lead FOREIGN KEY (id_lead) REFERENCES public.leads(id)
);




-- Índice único para email (evita duplicatas)
CREATE UNIQUE INDEX idx_leads_email ON leads(email);

-- Índice para telefone (busca frequente)
CREATE INDEX idx_leads_telefone ON leads(telefone);

-- Índice para nome (busca por nome)
CREATE INDEX idx_leads_nome ON leads(nome);

-- Índice para status (filtros por status)
CREATE INDEX idx_leads_status ON leads(status);

-- Índice para active (filtros por ativo/inativo)
CREATE INDEX idx_leads_active ON leads(active);

-- Índice para data_hora (ordenação cronológica)
CREATE INDEX idx_leads_data_hora ON leads(data_hora);

-- Índice para cidade e estado (busca geográfica)
CREATE INDEX idx_leads_localizacao ON leads(cidade, estado);

-- Índice composto para consultas por status e data
CREATE INDEX idx_leads_status_data ON leads(status, data_hora);

-- Função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger que executa a função
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- EXEMPLO DE INSERÇÃO DE DADOS
-- =====================================================

INSERT INTO leads (
    nome, 
    email, 
    telefone, 
    decisor, 
    endereco, 
    cidade, 
    estado, 
    instagram, 
    website, 
    status, 
    observacoes
) VALUES (
    'João Silva Santos',
    'joao.silva@empresa.com.br',
    '(11) 99999-8888',
    'Maria Oliveira',
    'Rua das Flores, 123 - Centro',
    'São Paulo',
    'SP',
    '@joaosilva_oficial',
    'https://www.empresajoao.com.br',
    'MEDIO INTERESSE',
    'Lead interessado em soluções de CRM. Reunião agendada para próxima semana.'
);


-- =====================================================
-- CONSULTAS ÚTEIS PARA O SISTEMA
-- =====================================================

-- Buscar leads por status
-- SELECT * FROM leads WHERE status = 'MUITO INTERESSADO' ORDER BY data_hora DESC;

-- Buscar leads por cidade
-- SELECT * FROM leads WHERE cidade = 'São Paulo' AND estado = 'SP';

-- Contar leads por status
-- SELECT status, COUNT(*) as total FROM leads GROUP BY status;

-- Leads cadastrados hoje
-- SELECT * FROM leads WHERE DATE(data_hora) = CURRENT_DATE;

-- Leads sem retorno há mais de 7 dias
-- SELECT * FROM leads WHERE status = 'SEM RETORNO' AND data_hora < (CURRENT_TIMESTAMP - INTERVAL '7 days');


-- =====================================================
-- ÍNDICES PARA OTIMIZAÇÃO DE CONSULTAS
-- =====================================================

-- Índice para id_lead (consultas por lead)
CREATE INDEX idx_messages_id_lead ON messages(id_lead);

-- Índice para data_hora (ordenação cronológica)
CREATE INDEX idx_messages_data_hora ON messages(data_hora);

-- Índice para meio_de_contato (filtros por canal)
CREATE INDEX idx_messages_meio_contato ON messages(meio_de_contato);

-- Índice para tipo_mensagem (filtros por tipo)
CREATE INDEX idx_messages_tipo_mensagem ON messages(tipo_mensagem);

-- Índice composto para consultas por lead e data
CREATE INDEX idx_messages_lead_data ON messages(id_lead, data_hora);


-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE messages IS 'Tabela para gerenciar mensagens e follow-ups dos leads';
COMMENT ON COLUMN messages.id IS 'Chave primária auto-incrementável';
COMMENT ON COLUMN messages.data_hora IS 'Data e hora de cadastro da mensagem';
COMMENT ON COLUMN messages.id_lead IS 'ID para vinculação com o lead (chave estrangeira)';
COMMENT ON COLUMN messages.mensagem_primeiro_contato IS 'Conteúdo da mensagem inicial';
COMMENT ON COLUMN messages.meio_de_contato IS 'Canal de comunicação utilizado';
COMMENT ON COLUMN messages.tipo_mensagem IS 'Tipo da mensagem: primeiro contato ou followup';
COMMENT ON COLUMN messages.identifica IS 'Identifica se a mensagem foi enviada ou recebida';

-- =====================================================
-- EXEMPLO DE INSERÇÃO DE DADOS
-- =====================================================

-- Exemplo de inserção de mensagem de primeiro contato
INSERT INTO messages (
    id_lead, 
    mensagem_primeiro_contato, 
    meio_de_contato,
    tipo_mensagem,
    identifica
) VALUES (
    1, 
    'Olá! Vi seu interesse em nossos produtos. Como posso ajudá-lo?', 
    'whatsapp',
    'primeiro contato',
    'Enviada'
);

-- Exemplo de inserção de follow-up
INSERT INTO messages (
    id_lead, 
    mensagem_primeiro_contato, 
    meio_de_contato,
    tipo_mensagem,
    identifica
) VALUES (
    1, 
    'Oi! Gostaria de saber se teve tempo de analisar nossa proposta?', 
    'whatsapp',
    'followup',
    'Enviada'
);

-- =====================================================
-- CONSULTAS ÚTEIS PARA O SISTEMA
-- =====================================================

-- Buscar todas as mensagens de um lead específico
-- SELECT * FROM messages WHERE id_lead = 1 ORDER BY data_hora DESC;

-- Buscar mensagens por canal de comunicação
-- SELECT * FROM messages WHERE meio_de_contato = 'whatsapp' ORDER BY data_hora DESC;

-- Buscar mensagens por tipo
-- SELECT * FROM messages WHERE tipo_mensagem = 'primeiro contato';

-- Buscar mensagens de follow-up
-- SELECT * FROM messages WHERE tipo_mensagem = 'followup';

-- Contar mensagens por tipo
-- SELECT tipo_mensagem, COUNT(*) as total 
-- FROM messages 
-- GROUP BY tipo_mensagem;

-- Buscar leads que receberam apenas primeiro contato (sem follow-up)
-- SELECT DISTINCT id_lead 
-- FROM messages m1
-- WHERE tipo_mensagem = 'primeiro contato'
-- AND NOT EXISTS (
--     SELECT 1 FROM messages m2 
--     WHERE m2.id_lead = m1.id_lead 
--     AND m2.tipo_mensagem = 'followup'
-- );

-- Relatório de mensagens por canal nos últimos 30 dias
-- SELECT 
--     meio_de_contato,
--     tipo_mensagem,
--     COUNT(*) as total_mensagens
-- FROM messages 
-- WHERE data_hora >= CURRENT_DATE - INTERVAL '30 days'
-- GROUP BY meio_de_contato, tipo_mensagem
-- ORDER BY meio_de_contato, tipo_mensagem;

-- Estatísticas por canal de comunicação
-- SELECT meio_de_contato, COUNT(*) as total_mensagens 
-- FROM messages 
-- GROUP BY meio_de_contato 
-- ORDER BY total_mensagens DESC;

-- Mensagens cadastradas hoje
-- SELECT * FROM messages WHERE DATE(data_hora) = CURRENT_DATE;

-- Leads com mais mensagens
-- SELECT l.nome, COUNT(m.id) as total_mensagens 
-- FROM leads l 
-- LEFT JOIN messages m ON l.id = m.id_lead 
-- GROUP BY l.id, l.nome 
-- ORDER BY total_mensagens DESC;



-- Tabela para armazenar informações sobre serviços/produtos
CREATE TABLE public.products (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao_detalhada TEXT NOT NULL,
  prompt_consultivo TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Índices para otimização
CREATE INDEX idx_products_nome ON public.products(nome);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_products_created_at ON public.products(created_at);

-- Trigger para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_products_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.products IS 'Tabela para armazenar informações sobre serviços/produtos oferecidos';
COMMENT ON COLUMN public.products.id IS 'Chave primária auto-incrementável';
COMMENT ON COLUMN public.products.nome IS 'Nome do produto/serviço (obrigatório)';
COMMENT ON COLUMN public.products.descricao_detalhada IS 'Descrição detalhada do produto/serviço (mínimo 1000 caracteres)';
COMMENT ON COLUMN public.products.prompt_consultivo IS 'Prompt consultivo para IA/assistentes (mínimo 5000 caracteres)';
COMMENT ON COLUMN public.products.active IS 'Indica se o produto está ativo (true) ou inativo (false)';
COMMENT ON COLUMN public.products.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN public.products.updated_at IS 'Data e hora da última atualização do registro';

-- Exemplo de inserção de dados
INSERT INTO public.products (
  nome,
  descricao_detalhada,
  prompt_consultivo,
  active
) VALUES (
  'Consultoria em Transformação Digital',
  'Serviço completo de consultoria em transformação digital para empresas que desejam modernizar seus processos e adotar tecnologias inovadoras. Oferecemos análise detalhada do cenário atual, desenvolvimento de roadmap estratégico, implementação de soluções tecnológicas e acompanhamento contínuo. Nossa metodologia inclui diagnóstico organizacional, mapeamento de processos, identificação de oportunidades de automação, seleção de tecnologias adequadas, planejamento de migração, treinamento de equipes e métricas de acompanhamento. Trabalhamos com tecnologias como cloud computing, IA, IoT, blockchain e analytics para garantir que sua empresa esteja preparada para os desafios do mercado digital.',
  'Você é um consultor especializado em transformação digital com mais de 10 anos de experiência. Sua abordagem é estratégica, data-driven e focada em resultados mensuráveis. Ao interagir com clientes, você deve:

1. INÍCIO DA CONVERSA:
   - Apresentar-se como consultor em transformação digital
   - Demonstrar compreensão dos desafios do setor do cliente
   - Coletar informações sobre o negócio, desafios atuais e objetivos

2. DIAGNÓSTICO E ANÁLISE:
   - Fazer perguntas estratégicas para entender:
     * Modelo de negócio atual e processos principais
     * Nível de maturidade digital da empresa
     * Principais desafios e pontos de dor
     * Objetivos de curto, médio e longo prazo
     * Orçamento disponível e timeline esperada

3. RECOMENDAÇÕES ESTRATÉGICAS:
   - Propor soluções personalizadas baseadas nas necessidades identificadas
   - Explicar benefícios de forma clara e quantificável quando possível
   - Sugerir tecnologias específicas e casos de uso relevantes
   - Apresentar roadmap com fases e marcos importantes

4. IMPLEMENTAÇÃO E ACOMPANHAMENTO:
   - Detalhar metodologia de implementação
   - Explicar processo de gestão de mudança e treinamento
   - Estabelecer métricas de sucesso e KPIs
   - Propor cronograma realista com entregas claras

5. VALOR PROPOSITIVO:
   - Destacar como a transformação digital pode:
     * Aumentar eficiência operacional em 30-50%
     * Melhorar experiência do cliente
     * Reduzir custos operacionais
     * Aumentar competitividade no mercado
     * Permitir escalabilidade do negócio

6. OBJEÇÕES COMUNS:
   - Preparar respostas para preocupações sobre:
     * Custo vs retorno (ROI)
     * Complexidade de implementação
     * Resistência à mudança organizacional
     * Segurança de dados
     * Tempo necessário para ver resultados

Mantenha um tom profissional, empático e consultivo. Adapte a linguagem conforme o perfil do interlocutor (CEO, gerente, técnico). Use exemplos concretos e cases de sucesso quando relevante. Foque sempre em como a tecnologia pode resolver problemas de negócio específicos.',
  true
);

-- Consultas úteis
-- Buscar produtos ativos
-- SELECT * FROM products WHERE active = true ORDER BY created_at DESC;

-- Buscar produto por ID
-- SELECT * FROM products WHERE id = 1;

-- Buscar produtos por termo no nome ou descrição
-- SELECT * FROM products 
-- WHERE active = true 
-- AND (nome ILIKE '%consultoria%' OR descricao_detalhada ILIKE '%digital%')
-- ORDER BY created_at DESC;

-- Contar produtos ativos
-- SELECT COUNT(*) as total_produtos_ativos FROM products WHERE active = true;

-- Atualizar produto
-- UPDATE products 
-- SET nome = 'Novo Nome', descricao_detalhada = 'Nova descrição...' 
-- WHERE id = 1;

-- Inativar produto (exclusão lógica)
-- UPDATE products SET active = false WHERE id = 1;


-- Adicionar novo campo id_product na tabela leads
ALTER TABLE public.leads 
ADD COLUMN id_product INTEGER NULL,
ADD CONSTRAINT fk_leads_product 
FOREIGN KEY (id_product) REFERENCES public.products(id);

-- Criar índice para otimizar consultas
CREATE INDEX idx_leads_id_product ON public.leads(id_product);

-- Comentário para documentação
COMMENT ON COLUMN public.leads.id_product IS 'ID do produto/serviço relacionado ao lead (opcional)';

-- Remover campo id_product da tabela messages (se existir)
ALTER TABLE public.messages 
DROP COLUMN IF EXISTS id_product;

-- Remover constraint se existir
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS fk_messages_product;

-- Remover índice se existir
DROP INDEX IF EXISTS idx_messages_id_product;

