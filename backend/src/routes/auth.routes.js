// src/routes/auth.routes.js
const { Router } = require('express')
const { body } = require('express-validator')
const { registrar, login, renovarToken, logout } = require('../controllers/authController')
const { validar } = require('../middlewares/validar')
const { autenticar } = require('../middlewares/auth')

const router = Router()

router.post('/register', [
  body('nome').trim().notEmpty().withMessage('Nome obrigatório').isLength({ min: 2, max: 100 }),
  body('email').isEmail().withMessage('E-mail inválido').normalizeEmail(),
  body('telefone').trim().notEmpty().withMessage('Telefone obrigatório'),
  body('senha').isLength({ min: 8 }).withMessage('Senha deve ter mínimo 8 caracteres'),
  body('tipo').optional().isIn(['PASSAGEIRO', 'MOTORISTA', 'AMBOS']),
  validar,
], registrar)

router.post('/login', [
  body('email').isEmail().withMessage('E-mail inválido').normalizeEmail(),
  body('senha').notEmpty().withMessage('Senha obrigatória'),
  validar,
], login)

router.post('/refresh', renovarToken)
router.post('/logout', autenticar, logout)

module.exports = router
