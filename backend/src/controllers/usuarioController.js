// src/controllers/usuarioController.js
const prisma = require('../config/database')
const { sucesso, erro, naoEncontrado } = require('../utils/resposta')

const meuPerfil = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true, nome: true, email: true, telefone: true, tipo: true, fotoPerfil: true,
        emailVerificado: true, telefoneVerificado: true, cnhVerificada: true,
        mediaAvaliacao: true, totalAvaliacoes: true, criadoEm: true,
        veiculos: { where: { ativo: true }, select: { id: true, modelo: true, marca: true, placa: true, cor: true, ano: true, capacidade: true } },
      },
    })
    const totalViagens = await prisma.solicitacao.count({ where: { passageiroId: req.usuario.id, status: 'ACEITA' } })
    return sucesso(res, { ...usuario, totalViagens })
  } catch (e) {
    return erro(res, 'Erro ao buscar perfil')
  }
}

const atualizarPerfil = async (req, res) => {
  try {
    const { nome, telefone } = req.body
    const usuario = await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: { nome, telefone },
      select: { id: true, nome: true, email: true, telefone: true, tipo: true, fotoPerfil: true },
    })
    return sucesso(res, usuario, 'Perfil atualizado')
  } catch (e) {
    return erro(res, 'Erro ao atualizar perfil')
  }
}

const perfilPublico = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, nome: true, fotoPerfil: true, tipo: true,
        mediaAvaliacao: true, totalAvaliacoes: true, criadoEm: true,
        avaliacoesRecebidas: {
          take: 5, orderBy: { criadoEm: 'desc' },
          select: { nota: true, comentario: true, criadoEm: true, avaliador: { select: { id: true, nome: true, fotoPerfil: true } } },
        },
      },
    })
    if (!usuario) return naoEncontrado(res, 'Usuário não encontrado')
    return sucesso(res, usuario)
  } catch (e) {
    return erro(res, 'Erro ao buscar usuário')
  }
}

const cadastrarVeiculo = async (req, res) => {
  try {
    const { modelo, marca, placa, cor, ano, capacidade } = req.body
    const veiculo = await prisma.veiculo.create({
      data: { motoristaId: req.usuario.id, modelo, marca, placa: placa.toUpperCase(), cor, ano: parseInt(ano), capacidade: parseInt(capacidade) || 4 },
    })
    return sucesso(res, veiculo, 'Veículo cadastrado', 201)
  } catch (e) {
    if (e.code === 'P2002') return erro(res, 'Placa já cadastrada', 409)
    return erro(res, 'Erro ao cadastrar veículo')
  }
}

const historico = async (req, res) => {
  try {
    const { pagina = 1, limite = 10 } = req.query
    const skip = (parseInt(pagina) - 1) * parseInt(limite)
    const [total, itens] = await Promise.all([
      prisma.historico.count({ where: { usuarioId: req.usuario.id } }),
      prisma.historico.findMany({
        where: { usuarioId: req.usuario.id }, skip, take: parseInt(limite),
        orderBy: { registradoEm: 'desc' },
        include: { viagem: { select: { id: true, origem: true, destino: true, horarioSaida: true, precoPorPessoa: true, status: true, motorista: { select: { id: true, nome: true, fotoPerfil: true } } } } },
      }),
    ])
    return sucesso(res, { itens, paginacao: { total, pagina: parseInt(pagina), totalPaginas: Math.ceil(total / parseInt(limite)) } })
  } catch (e) {
    return erro(res, 'Erro ao buscar histórico')
  }
}

module.exports = { meuPerfil, atualizarPerfil, perfilPublico, cadastrarVeiculo, historico }
