import express from 'express'
import {
  login,
  register,
  verifyAuth,
  logout
} from './auth.controller.js'
import { authenticate } from './auth.middleware.js'

const router = express.Router()

router.post('/login', login)
router.post('/register', register)
router.get('/verify-auth', authenticate, verifyAuth)
router.post('/logout', logout)

export default router
