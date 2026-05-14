// src/routes/viagem.routes.js
const { Router } = require('express')
const { body, query } = require('express-validator')
const viagem = require('../controllers/viagemController')
const sol = require('../controllers/solicitacaoController')
const { avaliar } = require('../controllers/avaliacaoController')
const { autenticar, exigirMotorista } = require('../middlewares/auth')
const { validar } = require('../middlewares/validar')

const router = Router()
router.use(autenticar)

router.get('/search', [query('origem').notEmpty(), query('destino').notEmpty(), validar], viagem.buscarViagens)
router.get('/minhas', exigirMotorista, viagem.minhasViagens)
router.post('/', exigirMotorista, [
  body('veiculoId').notEmpty(), body('origem').trim().notEmpty(), body('destino').trim().notEmpty(),
  body('horarioSaida').isISO8601(), body('vagas').isInt({ min: 1, max: 8 }),
  body('precoPorPessoa').isFloat({ min: 1 }), validar,
], viagem.criarViagem)
router.get('/:id', viagem.detalheViagem)
router.patch('/:id/status', exigirMotorista, [body('status').isIn(['EM_ANDAMENTO','FINALIZADA','CANCELADA']), validar], viagem.atualizarStatus)
router.post('/:id/requests', [body('pontoEmbarque').optional().trim(), validar], sol.solicitar)
router.get('/:id/requests', exigirMotorista, sol.listarSolicitacoes)
router.post('/:id/reviews', [body('avaliadoId').notEmpty(), body('nota').isInt({ min: 1, max: 5 }), validar], avaliar)

module.exports = router
