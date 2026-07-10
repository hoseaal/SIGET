import express from 'express'
import {
  login,
  register,
  verifyAuth,
  logout
} from './auth.controller.js'
import { validateSchema } from '../middlewares/validateSchema.js'
import { createUserSchema, loginSchema } from '../utils/schemas/userSchema.js'
import { authenticate, checkRole } from './auth.middleware.js'

const router = express.Router()


router.post('/login', validateSchema(loginSchema), login)
router.post('/register', authenticate, checkRole([1]), validateSchema(createUserSchema), register)
router.get('/verify-auth', authenticate, verifyAuth)
router.post('/logout', logout)

export default router
