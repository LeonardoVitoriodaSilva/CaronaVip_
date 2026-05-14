// src/middlewares/auth.js
const { verificarToken } = require('../utils/jwt')
const { naoAutorizado, proibido } = require('../utils/resposta')
const prisma = require('../config/database')

const autenticar = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return naoAutorizado(res, 'Token não fornecido')

    const token = header.split(' ')[1]
    const payload = verificarToken(token)

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { id: true, nome: true, email: true, tipo: true, ativo: true, bloqueado: true },
    })

    if (!usuario) return naoAutorizado(res, 'Usuário não encontrado')
    if (!usuario.ativo) return proibido(res, 'Conta desativada')
    if (usuario.bloqueado) return proibido(res, 'Conta bloqueada. Contate o suporte.')

    req.usuario = usuario
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') return naoAutorizado(res, 'Token expirado')
    return naoAutorizado(res, 'Token inválido')
  }
}

const exigirMotorista = (req, res, next) => {
  if (req.usuario.tipo !== 'MOTORISTA' && req.usuario.tipo !== 'AMBOS')
    return proibido(res, 'Apenas motoristas podem acessar este recurso')
  next()
}

const exigirPassageiro = (req, res, next) => {
  if (req.usuario.tipo !== 'PASSAGEIRO' && req.usuario.tipo !== 'AMBOS')
    return proibido(res, 'Apenas passageiros podem acessar este recurso')
  next()
}

module.exports = { autenticar, exigirMotorista, exigirPassageiro }
