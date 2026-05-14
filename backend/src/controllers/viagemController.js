// src/controllers/viagemController.js
const prisma = require('../config/database')
const { sucesso, criado, erro, naoEncontrado, proibido } = require('../utils/resposta')

const criarViagem = async (req, res) => {
  try {
    const { veiculoId, origem, destino, latOrigem, lngOrigem, latDestino, lngDestino,
            distanciaKm, duracaoMin, horarioSaida, vagas, precoPorPessoa, observacoes } = req.body

    const veiculo = await prisma.veiculo.findFirst({ where: { id: veiculoId, motoristaId: req.usuario.id, ativo: true } })
    if (!veiculo) return proibido(res, 'Veículo não encontrado ou não pertence a você')

    const nVagas = parseInt(vagas)
    if (nVagas > veiculo.capacidade) return erro(res, `Veículo comporta no máximo ${veiculo.capacidade} passageiros`, 400)

    const viagem = await prisma.viagem.create({
      data: {
        motoristaId: req.usuario.id, veiculoId,
        origem: origem.trim(), destino: destino.trim(),
        latOrigem: latOrigem ? parseFloat(latOrigem) : null,
        lngOrigem: lngOrigem ? parseFloat(lngOrigem) : null,
        latDestino: latDestino ? parseFloat(latDestino) : null,
        lngDestino: lngDestino ? parseFloat(lngDestino) : null,
        distanciaKm: distanciaKm ? parseFloat(distanciaKm) : null,
        duracaoMin: duracaoMin ? parseInt(duracaoMin) : null,
        horarioSaida: new Date(horarioSaida),
        vagasTotal: nVagas, vagasDisponiveis: nVagas,
        precoPorPessoa: parseFloat(precoPorPessoa),
        observacoes: observacoes || null,
      },
      include: {
        motorista: { select: { id: true, nome: true, fotoPerfil: true, mediaAvaliacao: true } },
        veiculo: true,
      },
    })

    await prisma.historico.create({ data: { viagemId: viagem.id, usuarioId: req.usuario.id, acao: 'VIAGEM_CRIADA' } })
    return criado(res, viagem, 'Viagem criada com sucesso')
  } catch (e) {
    console.error('[criarViagem]', e)
    return erro(res, 'Erro ao criar viagem')
  }
}

const buscarViagens = async (req, res) => {
  try {
    const { origem, destino, data, vagas = 1, pagina = 1, limite = 20 } = req.query
    if (!origem || !destino) return erro(res, 'Informe origem e destino', 400)

    const skip = (parseInt(pagina) - 1) * parseInt(limite)
    let filtroData = data
      ? (() => { const i = new Date(data); i.setHours(0,0,0,0); const f = new Date(data); f.setHours(23,59,59,999); return { horarioSaida: { gte: i, lte: f } } })()
      : { horarioSaida: { gte: new Date() } }

    const where = {
      origem: { contains: origem, mode: 'insensitive' },
      destino: { contains: destino, mode: 'insensitive' },
      status: 'DISPONIVEL',
      vagasDisponiveis: { gte: parseInt(vagas) },
      ...filtroData,
    }

    const [total, viagens] = await Promise.all([
      prisma.viagem.count({ where }),
      prisma.viagem.findMany({
        where, skip, take: parseInt(limite), orderBy: { horarioSaida: 'asc' },
        include: {
          motorista: { select: { id: true, nome: true, fotoPerfil: true, mediaAvaliacao: true, totalAvaliacoes: true } },
          veiculo: { select: { modelo: true, marca: true, cor: true, capacidade: true } },
          _count: { select: { solicitacoes: true } },
        },
      }),
    ])

    return sucesso(res, { viagens, paginacao: { total, pagina: parseInt(pagina), totalPaginas: Math.ceil(total / parseInt(limite)) } })
  } catch (e) {
    console.error('[buscarViagens]', e)
    return erro(res, 'Erro ao buscar viagens')
  }
}

const detalheViagem = async (req, res) => {
  try {
    const viagem = await prisma.viagem.findUnique({
      where: { id: req.params.id },
      include: {
        motorista: { select: { id: true, nome: true, fotoPerfil: true, mediaAvaliacao: true, totalAvaliacoes: true, cnhVerificada: true, telefoneVerificado: true } },
        veiculo: true,
        solicitacoes: { where: { status: 'ACEITA' }, select: { id: true, pontoEmbarque: true } },
      },
    })
    if (!viagem) return naoEncontrado(res, 'Viagem não encontrada')
    return sucesso(res, viagem)
  } catch (e) {
    return erro(res, 'Erro ao buscar viagem')
  }
}

const minhasViagens = async (req, res) => {
  try {
    const { status } = req.query
    const viagens = await prisma.viagem.findMany({
      where: { motoristaId: req.usuario.id, ...(status ? { status } : {}) },
      orderBy: { horarioSaida: 'desc' },
      include: {
        veiculo: { select: { modelo: true, marca: true, placa: true } },
        _count: { select: { solicitacoes: true } },
        solicitacoes: { where: { status: 'ACEITA' }, select: { id: true, passageiro: { select: { id: true, nome: true, fotoPerfil: true, mediaAvaliacao: true } } } },
      },
    })
    return sucesso(res, viagens)
  } catch (e) {
    return erro(res, 'Erro ao buscar viagens')
  }
}

const atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body
    const viagem = await prisma.viagem.findUnique({ where: { id: req.params.id } })
    if (!viagem) return naoEncontrado(res, 'Viagem não encontrada')
    if (viagem.motoristaId !== req.usuario.id) return proibido(res, 'Apenas o motorista pode alterar o status')

    const atualizada = await prisma.viagem.update({ where: { id: req.params.id }, data: { status } })
    const acaoMap = { EM_ANDAMENTO: 'VIAGEM_INICIADA', FINALIZADA: 'VIAGEM_FINALIZADA', CANCELADA: 'VIAGEM_CANCELADA' }
    await prisma.historico.create({ data: { viagemId: viagem.id, usuarioId: req.usuario.id, acao: acaoMap[status] } })

    return sucesso(res, atualizada, 'Status atualizado')
  } catch (e) {
    return erro(res, 'Erro ao atualizar status')
  }
}

module.exports = { criarViagem, buscarViagens, detalheViagem, minhasViagens, atualizarStatus }
