// src/controllers/avaliacaoController.js
const prisma = require('../config/database')
const { sucesso, criado, erro, naoEncontrado, proibido } = require('../utils/resposta')

const avaliar = async (req, res) => {
  try {
    const { avaliadoId, nota, comentario } = req.body
    const viagemId = req.params.id

    if (nota < 1 || nota > 5) return erro(res, 'Nota deve ser entre 1 e 5', 400)

    const viagem = await prisma.viagem.findUnique({ where: { id: viagemId } })
    if (!viagem) return naoEncontrado(res, 'Viagem não encontrada')
    if (viagem.status !== 'FINALIZADA') return erro(res, 'Só é possível avaliar viagens finalizadas', 400)

    const ehMotorista = viagem.motoristaId === req.usuario.id
    const solicitacao = await prisma.solicitacao.findFirst({ where: { viagemId, passageiroId: req.usuario.id, status: 'ACEITA' } })
    if (!ehMotorista && !solicitacao) return proibido(res, 'Você não participou desta viagem')

    const avaliacao = await prisma.avaliacao.create({
      data: { viagemId, avaliadorId: req.usuario.id, avaliadoId, nota: parseInt(nota), comentario: comentario?.trim() || null },
    })

    const stats = await prisma.avaliacao.aggregate({ where: { avaliadoId }, _avg: { nota: true }, _count: { nota: true } })
    await prisma.usuario.update({
      where: { id: avaliadoId },
      data: { mediaAvaliacao: Math.round((stats._avg.nota || 5) * 10) / 10, totalAvaliacoes: stats._count.nota },
    })

    await prisma.historico.create({ data: { viagemId, usuarioId: req.usuario.id, acao: 'AVALIACAO_REGISTRADA' } })
    return criado(res, avaliacao, 'Avaliação registrada com sucesso')
  } catch (e) {
    if (e.code === 'P2002') return erro(res, 'Você já avaliou esta viagem', 409)
    console.error('[avaliar]', e)
    return erro(res, 'Erro ao registrar avaliação')
  }
}

const avaliacoesUsuario = async (req, res) => {
  try {
    const { pagina = 1, limite = 10 } = req.query
    const skip = (parseInt(pagina) - 1) * parseInt(limite)
    const [total, avaliacoes] = await Promise.all([
      prisma.avaliacao.count({ where: { avaliadoId: req.params.id } }),
      prisma.avaliacao.findMany({
        where: { avaliadoId: req.params.id }, skip, take: parseInt(limite),
        orderBy: { criadoEm: 'desc' },
        include: {
          avaliador: { select: { id: true, nome: true, fotoPerfil: true } },
          viagem: { select: { origem: true, destino: true, horarioSaida: true } },
        },
      }),
    ])
    return sucesso(res, { avaliacoes, paginacao: { total, pagina: parseInt(pagina), totalPaginas: Math.ceil(total / parseInt(limite)) } })
  } catch (e) {
    return erro(res, 'Erro ao buscar avaliações')
  }
}

module.exports = { avaliar, avaliacoesUsuario }
