# 🚗 Carona VIP

Plataforma de mobilidade intermunicipal focada no **Piauí**.  
Conecta motoristas e passageiros em viagens entre cidades do estado.

---

## 📁 Estrutura do projeto

```
CaronaVip_System/
├── backend/          # API Node.js + Express + Prisma + PostgreSQL
├── mobile/           # App React Native + Expo
└── BRIEFING.md       # Contexto completo do projeto
```

---

## 🚀 Como rodar

### Backend
```bash
cd backend
cp .env.example .env
# Configure DATABASE_URL e JWT_SECRET no .env

npm install
npm run db:migrate
npm run db:seed
npm run dev
```
API disponível em: `http://localhost:3000`

### Mobile
```bash
cd mobile
npm install
npx expo start
```
Escaneie o QR com o app **Expo Go**.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Mobile | React Native + Expo |
| Backend | Node.js + Express |
| ORM | Prisma |
| Banco | PostgreSQL |
| Cache | Redis |
| Auth | JWT + bcrypt |
| Mapas | Google Maps SDK |
| Pagamentos | Pix + Stripe |

---

## 👥 Usuários de teste (após seed)

| E-mail | Senha | Perfil |
|---|---|---|
| joao@caronavip.com | senha123 | Passageiro |
| carlos@caronavip.com | senha123 | Motorista |
| ana@caronavip.com | senha123 | Passageiro |
