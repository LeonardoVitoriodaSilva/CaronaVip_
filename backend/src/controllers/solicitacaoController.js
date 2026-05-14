// src/controllers/solicitacaoController.js
const prisma = require('../config/database')
const { sucesso, criado, erro, naoEncontrado, proibido } = require('../utils/resposta')

const solicitar = async (req, res) => {
  try {
    const { pontoEmbarque, observacao } = req.body
    const viagemId = req.params.id

    const viagem = await prisma.viagem.findUnique({ where: { id: viagemId } })
    if (!viagem) return naoEncontrado(res, 'Viagem não encontrada')
    if (viagem.status !== 'DISPONIVEL') return erro(res, 'Viagem não disponível', 400)
    if (viagem.vagasDisponiveis < 1) return erro(res, 'Sem vagas disponíveis', 400)
    if (viagem.motoristaId === req.usuario.id) return proibido(res, 'Você não pode solicitar sua própria viagem')

    const jaExiste = await prisma.solicitacao.findUnique({
      where: { viagemId_passageiroId: { viagemId, passageiroId: req.usuario.id } },
    })
    if (jaExiste) return erro(res, 'Você já solicitou esta viagem', 409)

    const solicitacao = await prisma.solicitacao.create({
      data: { viagemId, passageiroId: req.usuario.id, pontoEmbarque: pontoEmbarque || null, observacao: observacao || null },
      include: {
        viagem: { select: { id: true, origem: true, destino: true, horarioSaida: true, precoPorPessoa: true } },
        passageiro: { select: { id: true, nome: true, fotoPerfil: true, mediaAvaliacao: true } },
      },
    })

    await prisma.historico.create({ data: { viagemId, usuarioId: req.usuario.id, acao: 'SOLICITACAO_ENVIADA' } })
    return criado(res, solicitacao, 'Solicitação enviada com sucesso')
  } catch (e) {
    console.error('[solicitar]', e)
    return erro(res, 'Erro ao solicitar viagem')
  }
}

const listarSolicitacoes = async (req, res) => {
  try {
    const viagem = await prisma.viagem.findUnique({ where: { id: req.params.id } })
    if (!viagem) return naoEncontrado(res, 'Viagem não encontrada')
    if (viagem.motoristaId !== req.usuario.id) return proibido(res, 'Acesso negado')

    const solicitacoes = await prisma.solicitacao.findMany({
      where: { viagemId: req.params.id },
      include: { passageiro: { select: { id: true, nome: true, fotoPerfil: true, mediaAvaliacao: true, totalAvaliacoes: true, telefoneVerificado: true } } },
      orderBy: { solicitadoEm: 'asc' },
    })
    return sucesso(res, solicitacoes)
  } catch (e) {
    return erro(res, 'Erro ao buscar solicitações')
  }
}

const responderSolicitacao = async (req, res) => {
  try {
    const { acao } = req.body
    const solicitacao = await prisma.solicitacao.findUnique({ where: { id: req.params.id }, include: { viagem: true } })
    if (!solicitacao) return naoEncontrado(res, 'Solicitação não encontrada')

    const ehMotorista = solicitacao.viagem.motoristaId === req.usuario.id
    const ehPassageiro = solicitacao.passageiroId === req.usuario.id
    if (!ehMotorista && !ehPassageiro) return proibido(res, 'Acesso negado')
    if ((acao === 'ACEITAR' || acao === 'RECUSAR') && !ehMotorista) return proibido(res, 'Apenas o motorista pode aceitar ou recusar')
    if (acao === 'CANCELAR' && !ehPassageiro) return proibido(res, 'Apenas o passageiro pode cancelar')
    if (solicitacao.status !== 'PENDENTE') return erro(res, 'Solicitação não está mais pendente', 400)

    const statusMap = { ACEITAR: 'ACEITA', RECUSAR: 'RECUSADA', CANCELAR: 'CANCELADA_PASSAGEIRO' }

    const resultado = await prisma.$transaction(async (tx) => {
      const atualizada = await tx.solicitacao.update({ where: { id: req.params.id }, data: { status: statusMap[acao] } })
      if (acao === 'ACEITAR') await tx.viagem.update({ where: { id: solicitacao.viagemId }, data: { vagasDisponiveis: { decrement: 1 } } })
      return atualizada
    })

    const acaoMap = { ACEITAR: 'SOLICITACAO_ACEITA', RECUSAR: 'SOLICITACAO_RECUSADA', CANCELAR: 'SOLICITACAO_CANCELADA' }
    await prisma.historico.create({ data: { viagemId: solicitacao.viagemId, usuarioId: req.usuario.id, acao: acaoMap[acao] } })

    const msg = { ACEITAR: 'Solicitação aceita!', RECUSAR: 'Solicitação recusada', CANCELAR: 'Solicitação cancelada' }
    return sucesso(res, resultado, msg[acao])
  } catch (e) {
    console.error('[responderSolicitacao]', e)
    return erro(res, 'Erro ao responder solicitação')
  }
}

module.exports = { solicitar, listarSolicitacoes, responderSolicitacao }
