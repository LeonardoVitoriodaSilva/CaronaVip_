// src/controllers/chatController.js
const prisma = require('../config/database')
const { sucesso, criado, erro, naoEncontrado, proibido } = require('../utils/resposta')

const participante = async (solicitacaoId, usuarioId) => {
  const s = await prisma.solicitacao.findUnique({ where: { id: solicitacaoId }, include: { viagem: true } })
  if (!s) return null
  const ok = s.passageiroId === usuarioId || s.viagem.motoristaId === usuarioId
  return ok ? s : null
}

const listarMensagens = async (req, res) => {
  try {
    const s = await participante(req.params.id, req.usuario.id)
    if (!s) return proibido(res, 'Acesso negado')

    const mensagens = await prisma.mensagem.findMany({
      where: { solicitacaoId: req.params.id },
      orderBy: { enviadaEm: 'asc' },
      include: { remetente: { select: { id: true, nome: true, fotoPerfil: true } } },
    })
    await prisma.mensagem.updateMany({
      where: { solicitacaoId: req.params.id, remetenteId: { not: req.usuario.id }, lida: false },
      data: { lida: true },
    })
    return sucesso(res, mensagens)
  } catch (e) {
    return erro(res, 'Erro ao buscar mensagens')
  }
}

const enviarMensagem = async (req, res) => {
  try {
    const { conteudo } = req.body
    if (!conteudo?.trim()) return erro(res, 'Mensagem não pode ser vazia', 400)

    const s = await participante(req.params.id, req.usuario.id)
    if (!s) return proibido(res, 'Acesso negado')

    const mensagem = await prisma.mensagem.create({
      data: { solicitacaoId: req.params.id, remetenteId: req.usuario.id, conteudo: conteudo.trim() },
      include: { remetente: { select: { id: true, nome: true, fotoPerfil: true } } },
    })
    return criado(res, mensagem, 'Mensagem enviada')
  } catch (e) {
    return erro(res, 'Erro ao enviar mensagem')
  }
}

const minhasConversas = async (req, res) => {
  try {
    const solicitacoes = await prisma.solicitacao.findMany({
      where: {
        OR: [{ passageiroId: req.usuario.id }, { viagem: { motoristaId: req.usuario.id } }],
        status: { in: ['PENDENTE', 'ACEITA'] },
      },
      include: {
        viagem: { select: { id: true, origem: true, destino: true, horarioSaida: true, motoristaId: true } },
        passageiro: { select: { id: true, nome: true, fotoPerfil: true } },
        mensagens: { orderBy: { enviadaEm: 'desc' }, take: 1 },
      },
      orderBy: { atualizadoEm: 'desc' },
    })

    const comNaoLidas = await Promise.all(solicitacoes.map(async (s) => ({
      ...s,
      naoLidas: await prisma.mensagem.count({ where: { solicitacaoId: s.id, remetenteId: { not: req.usuario.id }, lida: false } }),
    })))

    return sucesso(res, comNaoLidas)
  } catch (e) {
    return erro(res, 'Erro ao buscar conversas')
  }
}

module.exports = { listarMensagens, enviarMensagem, minhasConversas }
