// src/app.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : '*' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
app.use(limiter)

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', app: 'Carona VIP API', versao: '1.0.0' }))

// Cidades (público, sem auth)
app.get('/api/cities', (req, res) => {
  const cidades = require('./data/cidades-pi')
  const { q } = req.query
  const dados = q ? cidades.filter(c => c.toLowerCase().includes(q.toLowerCase())) : cidades
  res.json({ sucesso: true, dados })
})

// Rotas
app.use('/api/auth', authLimiter, require('./routes/auth.routes'))
app.use('/api/users', require('./routes/usuario.routes'))
app.use('/api/trips', require('./routes/viagem.routes'))
app.use('/api/requests', require('./routes/chat.routes'))

// 404
app.use((req, res) => res.status(404).json({ sucesso: false, mensagem: `${req.method} ${req.path} não encontrada` }))

// Erro global
app.use((err, req, res, next) => {
  console.error('[ERRO]', err)
  res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' })
})

module.exports = app
