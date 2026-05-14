// src/routes/chat.routes.js
const { Router } = require('express')
const { body } = require('express-validator')
const chat = require('../controllers/chatController')
const { responderSolicitacao } = require('../controllers/solicitacaoController')
const { autenticar } = require('../middlewares/auth')
const { validar } = require('../middlewares/validar')

const router = Router()
router.use(autenticar)

router.get('/conversations', chat.minhasConversas)
router.get('/:id/messages', chat.listarMensagens)
router.post('/:id/messages', [body('conteudo').trim().notEmpty().isLength({ max: 1000 }), validar], chat.enviarMensagem)
router.patch('/:id', [body('acao').isIn(['ACEITAR','RECUSAR','CANCELAR']), validar], responderSolicitacao)

module.exports = router
