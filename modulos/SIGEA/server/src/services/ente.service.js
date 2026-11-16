import { prisma } from '../config/prisma.js';
import { createEnteSchema, updateEnteSchema } from '../schemas/ente.schema.js';
import { HttpError, parseOrThrow } from '../utils/http-error.js';

function mapEnteError(error) {
  if (error.code === 'P2002') {
    return new HttpError(409, 'Ya existe un ente con ese RIF.');
  }

  if (error.code === 'P2025') {
    return new HttpError(404, 'No se encontró el ente solicitado.');
  }

  return error;
}

export async function createEnte(input) {
  const data = parseOrThrow(createEnteSchema, input);

  try {
    return await prisma.ente.create({ data });
  } catch (error) {
    throw mapEnteError(error);
  }
}

export async function listEntes() {
  return prisma.ente.findMany({
    include: { auditorias: true },
    orderBy: { name: 'asc' },
  });
}

export async function updateEnte(id, input) {
  const data = parseOrThrow(updateEnteSchema, input);

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, 'Debe indicar al menos un campo para actualizar.');
  }

  try {
    return await prisma.ente.update({ where: { id }, data });
  } catch (error) {
    throw mapEnteError(error);
  }
}

export async function deleteEnte(id) {
  try {
    await prisma.ente.delete({ where: { id } });
    return { message: 'Ente eliminado correctamente.' };
  } catch (error) {
    if (error.code === 'P2003') {
      throw new HttpError(409, 'No se puede eliminar porque tiene auditorías asociadas');
    }

    throw mapEnteError(error);
  }
}