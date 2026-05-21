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

## Funcionalidades (MVP)

- **Cadastro de Rotas** — formulário completo com validação e envio ao Supabase
- **Dashboard** — cards de resumo, tabela com busca/ordenação/filtros e agenda (dia/semana/mês)
- **Modal de detalhes** — ao clicar em evento do calendário ou linha da tabela
- **Layout administrativo** — sidebar, header, cores institucionais, responsivo

## Estrutura do projeto

```
src/
├── components/
│   ├── dashboard/    # StatsCards, RotasTable, RotasCalendar, modal
│   ├── layout/       # Sidebar, Header, AppLayout
│   ├── rotas/        # RotaForm
│   └── ui/           # Button, Input, Card, Dialog, Toast...
├── context/          # RotasProvider (dados globais)
├── hooks/            # useRotas, useToast
├── lib/              # supabase, utils, validations
├── pages/            # CadastroPage, DashboardPage
└── types/            # RotaMotorista, DashboardStats
supabase/migrations/  # SQL da tabela rotas_motoristas
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
2. No **SQL Editor**, execute o arquivo:

   `supabase/migrations/001_rotas_motoristas.sql`

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
| responsavel_solicitacao  | TEXT        |
| observacoes              | TEXT (null) |
| created_at               | TIMESTAMPTZ |

> **Segurança:** As políticas RLS atuais permitem acesso público (MVP interno). Ao implementar autenticação, substitua pelas políticas baseadas em `auth.uid()` e perfis de permissão.

## Expansões futuras preparadas

- Autenticação via `supabase.auth` (badge "Acesso interno" no header)
- Políticas RLS por perfil (admin, operador, visualizador)
- Autocomplete avançado de placas (datalist já incluído)
- CRUD de edição/exclusão de rotas
- Exportação para planilha/PDF

## Licença

Uso interno — Secretaria Municipal de Educação.
