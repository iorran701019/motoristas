# Rotas Motoristas — SME

Sistema web para gerenciamento de rotas e motoristas da Secretaria Municipal de Educação.

## Stack

| Camada      | Tecnologia                          |
| ----------- | ----------------------------------- |
| Frontend    | React 18 + TypeScript + TailwindCSS |
| Formulários | React Hook Form + Zod               |
| Tabela      | TanStack Table                      |
| Calendário  | FullCalendar                        |
| Ícones      | Lucide React                        |
| UI          | Componentes estilo shadcn/ui        |
| Backend     | Supabase (PostgreSQL)               |
| Hospedagem  | Vercel                              |

## Funcionalidades (V3)

- **Cadastro de Rotas** — formulário com validação; motorista e placa são selecionados a partir dos cadastros; toda rota nasce com status **Agendada**
- **Motoristas e Veículos** — aba de cadastro (nome/matrícula e placa/modelo/cor/tipo), acessível a todos os usuários; alimenta os seletores do cadastro de rota
- **Dashboard** — calendário no topo (filtro por motorista) + histórico abaixo; o status é alterado direto na linha da tabela (Agendada/Concluída/Cancelada/Adiada)
- **Relatórios** — geração e impressão (PDF/impressora) do histórico, filtrando por múltiplos status e período
- **Autenticação fechada** — login por e-mail/senha sem auto-cadastro e sem recuperação de senha na UI
- **Administração** — rota protegida para gestão de usuários (via Edge Function)
- **Layout administrativo** — sidebar, header, cores institucionais, responsivo

## Estrutura do projeto

```
src/
├── components/
│   ├── cadastros/    # MotoristaForm, VeiculoForm
│   ├── dashboard/    # RotasTable, RotasCalendar, modal
│   ├── layout/       # Sidebar, Header, AppLayout
│   ├── rotas/        # RotaForm
│   └── ui/           # Button, Input, Card, Dialog, Toast...
├── context/          # RotasProvider, CadastrosProvider, AuthProvider
├── hooks/            # useRotas, useCadastros, useToast
├── lib/              # supabase, utils, validations
├── pages/            # Cadastro, Dashboard, Cadastros, Relatorio, Login, Admin
└── types/            # RotaMotorista, Motorista, Veiculo, DashboardStats
supabase/
├── migrations/       # SQL do banco (rodar 001 → 004 em ordem)
└── functions/        # Edge Function admin-users
```

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com) (para deploy)

## Instalação local

### 1. Clonar e instalar dependências

```bash
cd educacao-especial
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute os arquivos **na ordem**:

   `supabase/migrations/001_rotas_motoristas.sql`
   `supabase/migrations/002_auth_status_admin.sql`
   `supabase/migrations/003_fix_rls_admin_function.sql`
   `supabase/migrations/004_motoristas_veiculos_status.sql`

3. Em **Project Settings → API**, copie:
   - Project URL
   - `anon` public key

### 3. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Executar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

### 5. Build de produção

```bash
npm run build
npm run preview
```

## Deploy na Vercel

1. Importe o repositório na Vercel
2. Framework Preset: **Vite**
3. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

O arquivo `vercel.json` já configura SPA routing.

## Banco de dados

Tabela: `rotas_motoristas`

| Campo                    | Tipo        |
| ------------------------ | ----------- |
| id                       | UUID (PK)   |
| motorista                | TEXT        |
| data                     | DATE        |
| placa_veiculo            | TEXT        |
| tipo_veiculo             | TEXT        |
| rota_descricao           | TEXT        |
| destino_principal        | TEXT        |
| horario_saida            | TIME        |
| horario_retorno          | TIME        |
| qtd_passageiros          | INTEGER     |
| status                   | TEXT (Agendada / Concluída / Cancelada / Adiada) |
| responsavel_solicitacao  | TEXT        |
| observacoes              | TEXT (null) |
| created_at               | TIMESTAMPTZ |

Tabela: `motoristas` — `id` (UUID PK), `nome_completo` (TEXT), `matricula` (TEXT único), `created_at`.

Tabela: `veiculos` — `id` (UUID PK), `placa` (TEXT único), `modelo` (TEXT), `cor` (TEXT), `tipo` (TEXT), `created_at`.

Ambas têm RLS liberada para qualquer usuário autenticado (criadas na migration 004).

### Autenticação e permissões

- A migration V2 fecha o acesso da tabela para usuários autenticados.
- A tabela `app_user_roles` define perfis (`admin`, `operador`).
- A rota `/admin` fica visível apenas para admins.

### Gestão de usuários (Edge Function `admin-users`)

As ações de **listar usuários**, **criar usuário** e **resetar senha** usam
`supabase.functions.invoke('admin-users')`, uma Edge Function que roda com a
Service Role Key no backend (nunca exposta ao front). O código está versionado em
`supabase/functions/admin-users/`.

**Deploy da função:**

```bash
# 1. Instale a CLI: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref SEU_PROJECT_REF

# 2. Publique a função
supabase functions deploy admin-users
```

As variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetadas
automaticamente pelo runtime do Supabase — não precisa configurá-las.

A função valida que o chamador está autenticado **e** tem papel `admin` em
`app_user_roles` antes de executar qualquer ação.

### Definir o primeiro administrador

Como não há auto-cadastro, crie o primeiro usuário e promova-o a admin manualmente:

1. Em **Authentication → Users**, crie o usuário (ou use a tela `/admin` depois).
2. No **SQL Editor**, rode (ajustando o e-mail):

   ```sql
   INSERT INTO app_user_roles (user_id, role)
   SELECT id, 'admin' FROM auth.users WHERE email = 'admin@prefeitura.gov.br'
   ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
   ```

A partir daí, esse admin pode criar e gerenciar os demais usuários pela tela `/admin`.

## Expansões futuras preparadas

- Políticas RLS mais granulares por secretaria/unidade
- Autocomplete avançado de placas (datalist já incluído)
- CRUD de edição/exclusão de rotas
- Exportação para planilha/PDF

## Licença

Uso interno — Secretaria Municipal de Educação.
