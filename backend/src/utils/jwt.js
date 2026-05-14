// src/utils/jwt.js
const jwt = require('jsonwebtoken')

const gerarAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' })

const gerarRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' })

const verificarToken = (token) => jwt.verify(token, process.env.JWT_SECRET)

const verificarRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET)

module.exports = { gerarAccessToken, gerarRefreshToken, verificarToken, verificarRefreshToken }
