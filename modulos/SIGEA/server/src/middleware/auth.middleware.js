import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/auth.js';
import { prisma } from '../config/prisma.js';

export const authenticate = async (request, response, next) => {
  const authorization = request.header('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    response.status(401).json({ error: 'Se requiere una sesión válida.' });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      response.status(401).json({ error: 'La sesión no es válida.' });
      return;
    }

    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId < 1) {
      response.status(401).json({ error: 'La sesión no es válida.' });
      return;
    }

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, rol: true },
    });

    if (!user) {
      response.status(401).json({ error: 'La cuenta de esta sesión ya no existe.' });
      return;
    }

    request.authUser = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.NotBeforeError) {
      response.status(401).json({ error: 'La sesión no es válida o ha vencido.' });
      return;
    }

    console.error('Error al validar la sesión:', error);
    response.status(500).json({ error: 'No se pudo validar la sesión.' });
  }
};
