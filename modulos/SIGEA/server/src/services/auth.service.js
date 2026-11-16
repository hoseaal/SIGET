import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/auth.js';
import { prisma } from '../config/prisma.js';
import { HttpError, parseOrThrow } from '../utils/http-error.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const bcryptRounds = 12;

function createToken(user, secret) {
  return jwt.sign(
    { rol: user.rol },
    secret,
    {
      subject: String(user.id),
      expiresIn: '8h',
    },
  );
}

export async function registerUser(input) {
  const { name, ci, password, rol } = parseOrThrow(registerSchema, input);
  const secret = getJwtSecret();

  const user = await prisma.usuario.create({
    data: {
      name,
      ci,
      rol,
      password: await bcrypt.hash(password, bcryptRounds),
    },
    select: { id: true, name: true, ci: true, rol: true },
  });

  return { token: createToken(user, secret), user };
}

export async function loginUser(input) {
  const { ci, password } = parseOrThrow(loginSchema, input);
  const secret = getJwtSecret();

  const user = await prisma.usuario.findUnique({ where: { ci } });
  const passwordIsValid = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !passwordIsValid) {
    throw new HttpError(401, 'Cédula o contraseña incorrecta.');
  }

  return {
    token: createToken(user, secret),
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
