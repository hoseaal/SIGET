import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRol } from '@prisma/client';
import { getJwtSecret } from '../config/auth.js';
import { prisma } from '../config/prisma.js';
import { HttpError, parsePositiveInteger } from '../utils/http-error.js';
import { registerSchema } from '../schemas/auth.schema.js';

const bcryptRounds = 12;

function createToken(userId) {
  return jwt.sign({}, getJwtSecret(), {
    subject: String(userId),
    expiresIn: '8h',
  });
}

export async function registerUser(input) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues.map((issue) => issue.message).join(' '));
  }
  const { name, ci, password } = parsed.data;

  const user = await prisma.usuario.create({
    data: {
      name: name.trim(),
      ci,
      rol: UserRol.ASISTENTE_ADMINISTRATIVO,
      password: await bcrypt.hash(password, bcryptRounds),
    },
    select: { id: true, name: true, ci: true, rol: true },
  });

  return { token: createToken(user.id), user };
}

export async function loginUser(input) {
  const ci = parsePositiveInteger(input.ci);
  if (ci === null || typeof input.password !== 'string' || input.password.length === 0) {
    throw new HttpError(400, 'Debes indicar una cédula y contraseña válidas.');
  }

  const user = await prisma.usuario.findUnique({ where: { ci } });
  const passwordIsValid = user ? await bcrypt.compare(input.password, user.password) : false;

  if (!user || !passwordIsValid) {
    throw new HttpError(401, 'Cédula o contraseña incorrecta.');
  }

  return {
    token: createToken(user.id),
    user: { id: user.id, name: user.name, ci: user.ci, rol: user.rol },
  };
}

export async function findCurrentUser(userId) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true, name: true, ci: true, rol: true, createdAt: true },
  });

  if (!user) {
    throw new HttpError(404, 'No se encontró el usuario.');
  }

  return user;
}
