import { prisma } from '../config/prisma.js';
import { createAuditoriaSchema, updateAuditoriaSchema } from '../schemas/auditoria.schema.js';
import { HttpError, parseOrThrow } from '../utils/http-error.js';

async function assertRelationsExist(entityId, typeId) {
  const [ente, tipo] = await Promise.all([
    prisma.ente.findUnique({ where: { id: entityId }, select: { id: true } }),
    prisma.auditoriaTipo.findUnique({ where: { id: typeId }, select: { id: true } }),
  ]);

  if (!ente) {
    throw new HttpError(404, 'No se encontró el ente indicado.');
  }

  if (!tipo) {
    throw new HttpError(404, 'No se encontró el tipo de auditoría indicado.');
  }
}

export async function createAuditoria(input) {
  const data = parseOrThrow(createAuditoriaSchema, input);
  await assertRelationsExist(data.entityId, data.typeId);

  try {
    return await prisma.auditoria.create({ data });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'Ya existe una auditoría con ese número.');
    }

    throw error;
  }
}

export async function listAuditorias() {
  return prisma.auditoria.findMany({
    include: { ente: true, tipo: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateAuditoria(id, input) {
  const data = parseOrThrow(updateAuditoriaSchema, input);

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, 'Debe indicar al menos un campo para actualizar.');
  }

  const current = await prisma.auditoria.findUnique({
    where: { id },
    select: { startDate: true, endDate: true, entityId: true, typeId: true },
  });

  if (!current) {
    throw new HttpError(404, 'No se encontró la auditoría solicitada.');
  }

  const startDate = data.startDate ?? current.startDate;
  const endDate = data.endDate ?? current.endDate;

  if (startDate && endDate && endDate < startDate) {
    throw new HttpError(400, 'La fecha de cierre no puede ser anterior a la fecha de inicio.');
  }

  await assertRelationsExist(data.entityId ?? current.entityId, data.typeId ?? current.typeId);

  try {
    return await prisma.auditoria.update({ where: { id }, data });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new HttpError(404, 'No se encontró la auditoría solicitada.');
    }

    throw error;
  }
}

export async function deleteAuditoria(id) {
  try {
    await prisma.auditoria.delete({ where: { id } });
    return { message: 'Auditoría eliminada correctamente.' };
  } catch (error) {
    if (error.code === 'P2003') {
      throw new HttpError(409, 'No se puede eliminar porque tiene solicitudes o cédulas asociadas');
    }

    if (error.code === 'P2025') {
      throw new HttpError(404, 'No se encontró la auditoría solicitada.');
    }

    throw error;
  }
}