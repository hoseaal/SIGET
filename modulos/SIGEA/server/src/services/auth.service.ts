import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRol } from '../generated/prisma/enums.js';
import { getJwtSecret } from '../config/auth.js';
import { prisma } from '../config/prisma.js';
import { HttpError, parsePositiveInteger } from '../utils/http-error.js';

const bcryptRounds = 12;

interface PublicUser {
  id: number;
  name: string;
  ci: number;
  rol: UserRol;
}

function createToken(userId: number): string {
  return jwt.sign({}, getJwtSecret(), {
    subject: String(userId),
    expiresIn: '8h',
  });
}

export async function registerUser(input: {
  name: unknown;
  ci: unknown;
  password: unknown;
}): Promise<{ token: string; user: PublicUser }> {
  const { name, password } = input;
  const ci = parsePositiveInteger(input.ci);

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    throw new HttpError(400, 'El nombre debe tener entre 2 y 100 caracteres.');
  }
  if (ci === null) {
    throw new HttpError(400, 'La cédula debe ser un número entero positivo.');
  }
  if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') < 10 ||
    Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'La contraseña debe tener entre 10 y 72 bytes.');
  }

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

export async function loginUser(input: {
  ci: unknown;
  password: unknown;
}): Promise<{ token: string; user: PublicUser }> {
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

export async function findCurrentUser(userId: number) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true, name: true, ci: true, rol: true, createdAt: true },
  });

  if (!user) {
    throw new HttpError(404, 'No se encontró el usuario.');
  }

  return user;
}
