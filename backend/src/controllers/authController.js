// src/controllers/authController.js
const bcrypt = require('bcryptjs')
const prisma = require('../config/database')
const { gerarAccessToken, gerarRefreshToken, verificarRefreshToken } = require('../utils/jwt')
const { sucesso, criado, erro, naoAutorizado, validacaoInvalida } = require('../utils/resposta')

const registrar = async (req, res) => {
  try {
    const { nome, email, telefone, senha, tipo } = req.body

    if (await prisma.usuario.findUnique({ where: { email } }))
      return validacaoInvalida(res, [{ campo: 'email', mensagem: 'E-mail já cadastrado' }])

    if (await prisma.usuario.findUnique({ where: { telefone } }))
      return validacaoInvalida(res, [{ campo: 'telefone', mensagem: 'Telefone já cadastrado' }])

    const senhaHash = await bcrypt.hash(senha, 12)
    const usuario = await prisma.usuario.create({
      data: { nome, email, telefone, senhaHash, tipo: tipo || 'PASSAGEIRO' },
      select: { id: true, nome: true, email: true, telefone: true, tipo: true, criadoEm: true },
    })

    const accessToken = gerarAccessToken({ id: usuario.id, tipo: usuario.tipo })
    const refreshToken = gerarRefreshToken({ id: usuario.id })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ data: { usuarioId: usuario.id, token: refreshToken, expiresAt } })

    return criado(res, { usuario, accessToken, refreshToken }, 'Conta criada com sucesso')
  } catch (e) {
    console.error('[registrar]', e)
    return erro(res, 'Erro ao criar conta')
  }
}

const login = async (req, res) => {
  try {
    const { email, senha } = req.body
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { veiculos: { where: { ativo: true }, select: { id: true, modelo: true, marca: true, placa: true, cor: true, capacidade: true } } },
    })

    if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash)))
      return naoAutorizado(res, 'E-mail ou senha incorretos')
    if (!usuario.ativo) return naoAutorizado(res, 'Conta desativada')
    if (usuario.bloqueado) return naoAutorizado(res, 'Conta bloqueada. Contate o suporte.')

    const accessToken = gerarAccessToken({ id: usuario.id, tipo: usuario.tipo })
    const refreshToken = gerarRefreshToken({ id: usuario.id })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ data: { usuarioId: usuario.id, token: refreshToken, expiresAt } })

    const { senhaHash, ...dados } = usuario
    return sucesso(res, { usuario: dados, accessToken, refreshToken }, 'Login realizado')
  } catch (e) {
    console.error('[login]', e)
    return erro(res, 'Erro ao fazer login')
  }
}

const renovarToken = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return naoAutorizado(res, 'Refresh token não fornecido')

    const payload = verificarRefreshToken(refreshToken)
    const salvo = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!salvo || salvo.expiresAt < new Date()) return naoAutorizado(res, 'Refresh token inválido ou expirado')

    const usuario = await prisma.usuario.findUnique({ where: { id: payload.id } })
    if (!usuario?.ativo) return naoAutorizado(res, 'Usuário não encontrado')

    return sucesso(res, { accessToken: gerarAccessToken({ id: usuario.id, tipo: usuario.tipo }) }, 'Token renovado')
  } catch (e) {
    return naoAutorizado(res, 'Refresh token inválido')
  }
}

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    return sucesso(res, null, 'Logout realizado')
  } catch (e) {
    return erro(res, 'Erro ao fazer logout')
  }
}

module.exports = { registrar, login, renovarToken, logout }
