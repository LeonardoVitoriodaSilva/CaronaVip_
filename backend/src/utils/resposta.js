// src/utils/resposta.js
const sucesso = (res, dados, mensagem = 'OK', status = 200) =>
  res.status(status).json({ sucesso: true, mensagem, dados })

const criado = (res, dados, mensagem = 'Criado com sucesso') =>
  sucesso(res, dados, mensagem, 201)

const erro = (res, mensagem = 'Erro interno', status = 500, detalhes = null) => {
  const corpo = { sucesso: false, mensagem }
  if (detalhes) corpo.detalhes = detalhes
  return res.status(status).json(corpo)
}

const naoAutorizado = (res, mensagem = 'Não autorizado') => erro(res, mensagem, 401)
const proibido = (res, mensagem = 'Acesso negado') => erro(res, mensagem, 403)
const naoEncontrado = (res, mensagem = 'Não encontrado') => erro(res, mensagem, 404)

const validacaoInvalida = (res, erros) =>
  res.status(422).json({ sucesso: false, mensagem: 'Dados inválidos', erros })

module.exports = { sucesso, criado, erro, naoAutorizado, proibido, naoEncontrado, validacaoInvalida }
