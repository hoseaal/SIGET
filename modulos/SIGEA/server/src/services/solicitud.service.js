import { prisma } from '../config/prisma.js';
import { createSolicitudSchema, answerDetailSchema } from '../schemas/solicitud.schema.js';
import { addBusinessDays } from './businessDays.service.js';
import { HttpError, parseOrThrow } from '../utils/http-error.js';

async function findDetail(id) {
  const detail = await prisma.detalleSolicitud.findUnique({
    where: { id },
    include: { ratificaciones: { orderBy: { ratificationNumber: 'asc' } } },
  });

  if (!detail) {
    throw new HttpError(404, 'No se encontró el detalle de solicitud solicitado.');
  }

  return detail;
}

export async function createSolicitud(input) {
  const data = parseOrThrow(createSolicitudSchema, input);

  const auditoria = await prisma.auditoria.findUnique({
    where: { id: data.auditId },
    select: { id: true },
  });

  if (!auditoria) {
    throw new HttpError(404, 'No se encontró la auditoría indicada.');
  }

  const dueDate = addBusinessDays(new Date(), data.businessDays);

  return prisma.solicitud.create({
    data: {
      auditId: data.auditId,
      businessDays: data.businessDays,
      dueDate,
      detalles: {
        create: data.detalles.map((detailRequest) => ({
          detailRequest,
          dueDate,
        })),
      },
    },
    include: { detalles: true },
  });
}

export async function listSolicitudes() {
  return prisma.solicitud.findMany({
    include: {
      auditoria: { include: { ente: true, tipo: true } },
      detalles: {
        include: { respuestas: true, ratificaciones: true },
        orderBy: { id: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function answerDetail(id, input) {
  const { responseText } = parseOrThrow(answerDetailSchema, input);

  await findDetail(id);

  const [respuesta, detalle] = await prisma.$transaction([
    prisma.respuesta.create({ data: { detailId: id, responseText } }),
    prisma.detalleSolicitud.update({
      where: { id },
      data: { status: 'RESPONDIDA' },
    }),
  ]);

  return { detalle, respuesta };
}

export async function ratifyDetail(id) {
  const detail = await findDetail(id);
  const totalRatifications = detail.ratificaciones.length;

  if (totalRatifications >= 2) {
    const detalle = await prisma.detalleSolicitud.update({
      where: { id },
      data: { status: 'DERIVADA' },
    });

    return {
      created: false,
      body: {
        message: 'El detalle ya fue ratificado dos veces; se derivó para su tratamiento.',
        detalle,
        ratificaciones: detail.ratificaciones,
      },
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const ratificacion = await tx.ratificacion.create({
        data: {
          detailId: id,
          ratificationNumber: totalRatifications + 1,
        },
      });

      const detalle = await tx.detalleSolicitud.update({
        where: { id },
        data: { status: 'RATIFICADA' },
      });

      return { ratificacion, detalle };
    });

    return {
      created: true,
      body: {
        message: `Ratificación número ${result.ratificacion.ratificationNumber} registrada.`,
        ...result,
      },
    };
  } catch (error) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'La ratificación indicada ya existe para este detalle.');
    }

    if (error.code === 'P2025') {
      throw new HttpError(404, 'No se encontró el detalle de solicitud solicitado.');
    }

    throw error;
  }
}