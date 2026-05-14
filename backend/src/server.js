// src/server.js
const app = require('./app')
const prisma = require('./config/database')

const PORT = process.env.PORT || 3000

async function iniciar() {
  try {
    await prisma.$connect()
    console.log('✅ Banco de dados conectado')
    app.listen(PORT, () => {
      console.log(`\n🚗 Carona VIP API rodando em http://localhost:${PORT}`)
      console.log(`   Health: http://localhost:${PORT}/health\n`)
    })
  } catch (err) {
    console.error('❌ Erro ao iniciar:', err)
    process.exit(1)
  }
}

process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0) })

iniciar()
