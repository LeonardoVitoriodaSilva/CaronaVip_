# BRIEFING.md — Carona VIP
> Cole este arquivo no Claude Code com: `claude --context BRIEFING.md`
> Ou simplesmente abra o terminal na pasta do projeto e diga: "leia o BRIEFING.md e comece o projeto"

---

## 🚗 O QUE É O PROJETO

**Carona VIP** é um aplicativo de mobilidade intermunicipal focado no **Piauí**.
Conecta motoristas e passageiros em viagens entre cidades do estado.

**Problema que resolve:**
- Baixa disponibilidade de transporte entre cidades pequenas
- Alto custo do transporte tradicional
- Falta de flexibilidade de horários
- Ausência de soluções digitais regionais

**Público-alvo:**
- Passageiros: estudantes, trabalhadores, viajantes frequentes
- Motoristas: pessoas que fazem rotas regulares e querem dividir custos

---

## 🎨 IDENTIDADE VISUAL

| Token | Valor | Uso |
|---|---|---|
| `--navy` | `#1B2B4B` | Sidebar, títulos, botões secundários |
| `--orange` | `#E07B1A` | Destaque, botões primários, ícones ativos |
| `--beige` | `#F5F0E8` | Fundo geral, inputs |
| `--black` | `#111111` | Botão "Entrar" do login |
| `--green` | `#2ECC71` | Status de sucesso |
| `--red` | `#E74C3C` | Erros, cancelamentos |

**Fontes:** Inter (principal) — sem serifa, limpa  
**Estilo:** Cards brancos com sombra suave, inputs pill-shape, sidebar escura navy

---

## 🏗️ ARQUITETURA TÉCNICA

```
┌─────────────────┐     HTTPS/REST      ┌──────────────────────┐
│   App Mobile    │ ◄──────────────────► │   API Node.js        │
│  React Native   │                      │   Express + Prisma   │
│  (Expo)         │                      │   Porta 3000         │
└─────────────────┘                      └──────────┬───────────┘
                                                    │
                              ┌─────────────────────┼──────────────────┐
                              │                     │                  │
                        ┌─────▼─────┐        ┌──────▼──────┐   ┌──────▼──────┐
                        │PostgreSQL │        │    Redis    │   │  Firebase   │
                        │  (dados)  │        │  (cache/    │   │  (realtime/ │
                        └───────────┘        │   sessões)  │   │   chat)     │
                                             └─────────────┘   └─────────────┘
```

**Decisões técnicas e por quê:**

| Componente | Escolha | Motivo |
|---|---|---|
| Mobile | React Native + Expo | Um código para iOS e Android, deploy fácil |
| Backend | Node.js + Express | I/O assíncrono, JS no front e back |
| ORM | Prisma | Type-safe, migrations automáticas, studio visual |
| Banco principal | PostgreSQL | ACID para reservas de vagas, PostGIS para geo |
| Cache | Redis | Sessões JWT, rate limiting, buscas frequentes |
| Realtime | Firebase RTDB | Chat e geolocalização sem infra adicional |
| Auth | JWT + bcrypt | Stateless, escala horizontal, bcrypt salt 12 |
| Mapas | Google Maps SDK | Melhor cobertura no interior do Piauí |
| Pagamentos | Stripe + Pix | Cartão (PCI) + Pix sem taxa para usuário |

---

## 📁 ESTRUTURA DE PASTAS

```
carona-vip/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── authController.js    # register, login, refresh, logout
│   │   │   ├── usuarioController.js # perfil, veículos, histórico
│   │   │   ├── viagemController.js  # CRUD viagens, busca, status
│   │   │   ├── solicitacaoController.js # solicitar, aceitar, recusar
│   │   │   ├── chatController.js    # mensagens, conversas
│   │   │   └── avaliacaoController.js   # avaliar, listar avaliações
│   │   ├── middlewares/
│   │   │   ├── auth.js              # autenticar, exigirMotorista, exigirPassageiro
│   │   │   └── validar.js           # wrapper do express-validator
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── usuario.routes.js
│   │   │   ├── viagem.routes.js
│   │   │   └── chat.routes.js
│   │   ├── utils/
│   │   │   ├── jwt.js               # gerarAccessToken, gerarRefreshToken
│   │   │   └── resposta.js          # sucesso(), erro(), criado(), etc.
│   │   ├── data/
│   │   │   └── cidades-pi.js        # 224 municípios do Piauí
│   │   ├── app.js                   # Express config, middlewares, rotas
│   │   └── server.js                # Porta, conexão DB, graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma            # Modelagem completa do banco
│   │   └── seed.js                  # Dados iniciais para testes
│   ├── .env.example
│   └── package.json
│
└── mobile/
    ├── src/
    │   ├── screens/
    │   │   ├── auth/
    │   │   │   ├── LoginScreen.tsx
    │   │   │   └── RegisterScreen.tsx
    │   │   ├── passenger/
    │   │   │   ├── DashboardScreen.tsx
    │   │   │   ├── SearchScreen.tsx
    │   │   │   ├── TripDetailScreen.tsx
    │   │   │   └── ChatScreen.tsx
    │   │   ├── driver/
    │   │   │   ├── DriverDashboardScreen.tsx
    │   │   │   ├── CreateTripScreen.tsx
    │   │   │   ├── MyTripsScreen.tsx
    │   │   │   └── RequestsScreen.tsx
    │   │   └── shared/
    │   │       ├── ProfileScreen.tsx
    │   │       ├── HistoryScreen.tsx
    │   │       └── ReviewScreen.tsx
    │   ├── components/
    │   │   ├── TripCard.tsx
    │   │   ├── CityAutocomplete.tsx  # Campo com 224 cidades do PI
    │   │   ├── MapView.tsx
    │   │   ├── ChatBubble.tsx
    │   │   └── StarRating.tsx
    │   ├── services/
    │   │   ├── api.ts                # axios instance com baseURL e interceptors
    │   │   ├── authService.ts
    │   │   ├── tripService.ts
    │   │   └── chatService.ts
    │   ├── store/
    │   │   ├── authSlice.ts          # Redux: usuário, tokens
    │   │   ├── tripsSlice.ts
    │   │   └── chatSlice.ts
    │   ├── navigation/
    │   │   ├── AppNavigator.tsx      # Stack raiz
    │   │   └── AuthNavigator.tsx
    │   └── theme/
    │       └── index.ts              # Cores, fontes, espaçamentos
    └── package.json
```

---

## 🗄️ BANCO DE DADOS — TABELAS

### `usuarios`
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | Identificador único |
| nome | String | Nome completo |
| email | String UNIQUE | E-mail (login) |
| telefone | String UNIQUE | Telefone verificado |
| senhaHash | String | bcrypt salt 12 |
| tipo | Enum | PASSAGEIRO / MOTORISTA / AMBOS |
| emailVerificado | Boolean | Verificação por e-mail |
| telefoneVerificado | Boolean | Verificação por SMS |
| cnhVerificada | Boolean | Apenas motoristas |
| mediaAvaliacao | Float | Média das notas recebidas |
| totalAvaliacoes | Int | Quantidade de avaliações |
| totalCancelamentos | Int | Contagem de cancelamentos abusivos |
| bloqueado | Boolean | Conta suspensa por abuso |
| criadoEm | DateTime | Timestamp de criação |

### `veiculos`
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | |
| motoristaId | UUID FK | → usuarios.id |
| modelo | String | Ex: Civic |
| marca | String | Ex: Honda |
| placa | String UNIQUE | Formato Mercosul |
| cor | String | |
| ano | Int | |
| capacidade | Int | Máximo de passageiros |
| ativo | Boolean | |

### `viagens`
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | |
| motoristaId | UUID FK | → usuarios.id |
| veiculoId | UUID FK | → veiculos.id |
| origem | String | Cidade de partida |
| destino | String | Cidade de destino |
| latOrigem / lngOrigem | Float? | Coordenadas de origem |
| latDestino / lngDestino | Float? | Coordenadas de destino |
| distanciaKm | Float? | Calculado pelo Maps |
| duracaoMin | Int? | Tempo estimado |
| horarioSaida | DateTime | Data e hora da saída |
| vagasTotal | Int | Total de vagas ofertadas |
| vagasDisponiveis | Int | Decrementado a cada aceite |
| precoPorPessoa | Float | Valor cobrado por passageiro |
| status | Enum | DISPONIVEL / EM_ANDAMENTO / FINALIZADA / CANCELADA |

### `solicitacoes`
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | |
| viagemId | UUID FK | → viagens.id |
| passageiroId | UUID FK | → usuarios.id |
| pontoEmbarque | String? | Onde o passageiro embarca |
| status | Enum | PENDENTE / ACEITA / RECUSADA / CANCELADA_PASSAGEIRO / CANCELADA_MOTORISTA |
| UNIQUE | (viagemId, passageiroId) | Evita solicitação duplicada |

### `mensagens`
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | |
| solicitacaoId | UUID FK | → solicitacoes.id |
| remetenteId | UUID FK | → usuarios.id |
| conteudo | String | Texto da mensagem |
| lida | Boolean | Controle de leitura |
| enviadaEm | DateTime | |

### `avaliacoes`
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | |
| viagemId | UUID FK | → viagens.id |
| avaliadorId | UUID FK | → usuarios.id |
| avaliadoId | UUID FK | → usuarios.id |
| nota | Int | 1 a 5 |
| comentario | String? | |
| UNIQUE | (viagemId, avaliadorId) | Uma avaliação por viagem |

### `pagamentos`
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | |
| solicitacaoId | UUID FK UNIQUE | → solicitacoes.id |
| valor | Float | Valor total |
| taxaPlataforma | Float | Comissão (8-12%) |
| valorMotorista | Float | valor - taxaPlataforma |
| metodo | Enum | PIX / CARTAO_CREDITO / CARTAO_DEBITO / DINHEIRO |
| status | Enum | PENDENTE / APROVADO / RECUSADO / ESTORNADO |

### `historico`
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | |
| viagemId | UUID FK | → viagens.id |
| usuarioId | UUID FK | → usuarios.id |
| acao | Enum | VIAGEM_CRIADA, VIAGEM_FINALIZADA, SOLICITACAO_ACEITA, etc. |
| metadata | JSON? | Dados adicionais do evento |

---

## 🔌 ENDPOINTS DA API

### Autenticação
```
POST   /api/auth/register     → Criar conta (nome, email, telefone, senha, tipo)
POST   /api/auth/login        → Login (email, senha) → accessToken + refreshToken
POST   /api/auth/refresh      → Renovar token (refreshToken)
POST   /api/auth/logout       → Invalidar token (requer auth)
```

### Usuários
```
GET    /api/users/me          → Perfil completo do usuário logado
PUT    /api/users/me          → Editar perfil (nome, telefone)
GET    /api/users/me/history  → Histórico de viagens paginado
GET    /api/users/:id         → Perfil público de outro usuário
GET    /api/users/:id/reviews → Avaliações recebidas
POST   /api/users/vehicles    → Cadastrar veículo (só motorista)
```

### Viagens
```
GET    /api/trips/search      → Buscar viagens (origem, destino, data, vagas)
GET    /api/trips/minhas      → Viagens criadas pelo motorista logado
POST   /api/trips             → Criar nova viagem (só motorista)
GET    /api/trips/:id         → Detalhes de uma viagem
PATCH  /api/trips/:id/status  → Atualizar status (EM_ANDAMENTO, FINALIZADA, CANCELADA)
POST   /api/trips/:id/reviews → Avaliar após viagem finalizada
```

### Solicitações e Chat
```
POST   /api/trips/:id/requests   → Passageiro solicita carona
GET    /api/trips/:id/requests   → Motorista vê solicitações
PATCH  /api/requests/:id         → Aceitar/Recusar/Cancelar solicitação
GET    /api/requests/conversations → Lista conversas do usuário
GET    /api/requests/:id/messages  → Mensagens de uma conversa
POST   /api/requests/:id/messages  → Enviar mensagem
```

### Utilitários
```
GET    /api/cities?q=tere     → Busca cidades do Piauí (autocomplete)
GET    /health                 → Health check da API
```

---

## 🔐 REGRAS DE NEGÓCIO CRÍTICAS

1. **Vagas:** Decrementadas em transação atômica ao aceitar solicitação (evita double-booking)
2. **Cancelamentos:** Máximo 3/mês — acima disso reduz score e pode bloquear conta
3. **Avaliação:** Só habilitada após viagem com status `FINALIZADA`
4. **Telefone:** Nunca exposto entre usuários — comunicação apenas pelo chat interno
5. **Solicitação duplicada:** Constraint UNIQUE `(viagemId, passageiroId)` no banco
6. **Motorista na própria viagem:** Controller rejeita solicitação se `motoristaId === passageiroId`
7. **Vagas vs capacidade:** Vagas ofertadas não podem superar `veiculo.capacidade`
8. **Status da viagem:** Máquina de estados → DISPONIVEL → EM_ANDAMENTO → FINALIZADA | CANCELADA

---

## 💰 MODELO DE MONETIZAÇÃO

| Fase | Receita | Detalhes |
|---|---|---|
| 0–6 meses | R$ 0 | Comissão zero para atrair usuários |
| 6–12 meses | 8–12% por viagem | Descontado automaticamente no pagamento |
| 12+ meses | Plano Premium R$29–59/mês | Motorista no topo das buscas + badge verificado |
| 12+ meses | Viagem em destaque R$5–15 | Prioridade na listagem por rota |
| 18+ meses | Parcerias B2B R$200–2k/mês | Postos, hotéis, empresas locais |

---

## 🌱 DADOS DE TESTE (seed)

Após `npm run db:seed`, os seguintes usuários estarão disponíveis:

| E-mail | Senha | Tipo |
|---|---|---|
| joao@caronavip.com | senha123 | Passageiro |
| carlos@caronavip.com | senha123 | Motorista |
| ana@caronavip.com | senha123 | Passageiro |

---

## 🚀 COMO RODAR O PROJETO

### Pré-requisitos
- Node.js 18+
- PostgreSQL rodando localmente
- npm ou yarn

### Backend
```bash
cd backend
cp .env.example .env
# Edite .env com sua DATABASE_URL e JWT_SECRET

npm install
npm run db:migrate      # Cria as tabelas
npm run db:seed         # Popula com dados de teste
npm run dev             # Inicia em modo desenvolvimento
```

A API estará em: `http://localhost:3000`
Health check: `http://localhost:3000/health`

### Mobile (depois do backend)
```bash
cd mobile
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** no celular.

---

## 📋 ORDEM DE DESENVOLVIMENTO RECOMENDADA

### Sprint 1 — Backend base
- [x] Schema Prisma completo
- [x] Auth (register, login, refresh, logout)
- [x] CRUD de viagens
- [x] Solicitações (solicitar, aceitar, recusar)
- [x] Chat (mensagens)
- [x] Avaliações
- [ ] Testes com Insomnia/Postman

### Sprint 2 — Mobile
- [ ] Navegação (React Navigation)
- [ ] Telas de autenticação
- [ ] Dashboard passageiro
- [ ] Busca de viagens com autocomplete de cidades PI
- [ ] Tela de detalhes da viagem
- [ ] Dashboard motorista
- [ ] Criar viagem
- [ ] Gerenciar solicitações

### Sprint 3 — Features avançadas
- [ ] Chat em tempo real (Firebase)
- [ ] Geolocalização no mapa
- [ ] Push notifications (FCM)
- [ ] Pagamentos (Pix)
- [ ] Upload de foto de perfil

### Sprint 4 — Qualidade
- [ ] Testes automatizados (Jest)
- [ ] CI/CD (GitHub Actions)
- [ ] Deploy backend (Railway ou Render)
- [ ] Publicação nas lojas (Play Store / App Store)

---

## 🗺️ CIDADES DO PIAUÍ

O app tem autocomplete com os **224 municípios do Piauí**.
As rotas mais comuns serão:
- Teresina ↔ Parnaíba (336 km)
- Teresina ↔ Picos (308 km)
- Teresina ↔ Floriano (240 km)
- Teresina ↔ Campo Maior (94 km)
- Teresina ↔ Piripiri (155 km)
- Teresina ↔ São Raimundo Nonato (520 km)
- Picos ↔ Floriano (180 km)
- Parnaíba ↔ Luís Correia (18 km)

---

## 💡 DICAS PARA O CLAUDE CODE

Quando abrir o projeto no Claude Code, você pode pedir:

```
"Leia o BRIEFING.md e implemente o Sprint 1 completo do backend"

"Crie os testes automatizados para o authController"

"Implemente o upload de foto de perfil usando multer"

"Crie a tela SearchScreen no mobile com o CityAutocomplete"

"Adicione suporte a WebSocket para o chat em tempo real"

"Configure o deploy no Railway com as variáveis de ambiente corretas"
```
