import express from 'express'
import { login, verifyAuth, logout } from './auth.controller.js'
import { authenticate } from './auth.middleware.js'

const router = express.Router()

router.post('/login', login)
router.get('/verify-auth', authenticate, verifyAuth)
router.post('/logout', logout)

export default router
