import { prisma } from '../src/config/prisma.js';

async function main(): Promise<void> {
  const ente = await prisma.ente.upsert({
    where: { rif: 'J-99999999-9' },
    update: {},
    create: {
      name: 'Ente de prueba SIGEA',
      rif: 'J-99999999-9',
      siglas: 'SIGEA-TEST',
      autoridad: 'Dato ficticio para pruebas',
    },
  });

  let tipo = await prisma.auditoriaTipo.findFirst({
    where: { nameType: 'Tipo de auditoria de prueba SIGEA' },
  });

  if (!tipo) {
    tipo = await prisma.auditoriaTipo.create({
      data: { nameType: 'Tipo de auditoria de prueba SIGEA' },
    });
  }

  const auditoria = await prisma.auditoria.upsert({
    where: { auditNumber: 999999 },
    update: {},
    create: {
      auditNumber: 999999,
      entityId: ente.id,
      typeId: tipo.id,
    },
  });

  let solicitud = await prisma.solicitud.findFirst({
    where: { auditId: auditoria.id },
  });

  if (!solicitud) {
    solicitud = await prisma.solicitud.create({
      data: {
        auditId: auditoria.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const detalle = await prisma.detalleSolicitud.findFirst({
    where: {
      idRequest: solicitud.id,
      detailRequest: 'Detalle ficticio para validar el flujo de SIGEA',
    },
  });

  if (!detalle) {
    await prisma.detalleSolicitud.create({
      data: {
        idRequest: solicitud.id,
        detailRequest: 'Detalle ficticio para validar el flujo de SIGEA',
      },
    });
  }

  console.log('Seeder de prueba SIGEA ejecutado correctamente.');
}

main()
  .catch((error: unknown) => {
    console.error('Error al ejecutar el seeder de SIGEA:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
