// src/middlewares/validar.js
const { validationResult } = require('express-validator')
const { validacaoInvalida } = require('../utils/resposta')

const validar = (req, res, next) => {
  const erros = validationResult(req)
  if (!erros.isEmpty()) {
    const formatados = erros.array().map((e) => ({ campo: e.path, mensagem: e.msg }))
    return validacaoInvalida(res, formatados)
  }
  next()
}

module.exports = { validar }
