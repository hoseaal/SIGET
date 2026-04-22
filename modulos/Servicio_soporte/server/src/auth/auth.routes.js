import express from 'express'
import {
  login,
  register,
  verifyAuth,
  logout
} from './auth.controller.js'
import { authenticate, checkRole } from './auth.middleware.js'

const router = express.Router()


router.post('/login', login)
router.post('/register', authenticate, checkRole([1]), register)
router.get('/verify-auth', authenticate, verifyAuth)
router.post('/logout', logout)

export default router
