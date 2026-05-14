// src/routes/usuario.routes.js
const { Router } = require('express')
const { body } = require('express-validator')
const ctrl = require('../controllers/usuarioController')
const { avaliacoesUsuario } = require('../controllers/avaliacaoController')
const { autenticar, exigirMotorista } = require('../middlewares/auth')
const { validar } = require('../middlewares/validar')

const router = Router()
router.use(autenticar)

router.get('/me', ctrl.meuPerfil)
router.put('/me', [body('nome').optional().trim(), body('telefone').optional(), validar], ctrl.atualizarPerfil)
router.get('/me/history', ctrl.historico)
router.get('/:id', ctrl.perfilPublico)
router.get('/:id/reviews', avaliacoesUsuario)
router.post('/vehicles', exigirMotorista, [
  body('modelo').trim().notEmpty(), body('marca').trim().notEmpty(),
  body('placa').trim().notEmpty(), body('cor').trim().notEmpty(),
  body('ano').isInt({ min: 1990 }), validar,
], ctrl.cadastrarVeiculo)

module.exports = router
