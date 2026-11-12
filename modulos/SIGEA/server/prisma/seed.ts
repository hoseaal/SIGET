import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';
import { UserRol } from '../src/generated/prisma/enums.js';

async function main(): Promise<void> {
  const name = process.env.DIRECTOR_NAME;
  const ciValue = process.env.DIRECTOR_CI;
  const password = process.env.DIRECTOR_PASSWORD;
  const configuredValues = [name, ciValue, password].filter((value) => value !== undefined);

  if (configuredValues.length === 0) {
    console.log('No se creó una cuenta inicial. Configura DIRECTOR_NAME, DIRECTOR_CI y DIRECTOR_PASSWORD.');
    return;
  }
  if (configuredValues.length !== 3 || !name || !ciValue || !password) {
    throw new Error('Configura DIRECTOR_NAME, DIRECTOR_CI y DIRECTOR_PASSWORD juntos.');
  }

  const ci = Number(ciValue);
  if (!Number.isSafeInteger(ci) || ci < 1 || ci > 2_147_483_647) {
    throw new Error('DIRECTOR_CI debe ser un entero positivo de hasta 2147483647.');
  }
  if (name.trim().length < 2 || name.trim().length > 100) {
    throw new Error('DIRECTOR_NAME debe tener entre 2 y 100 caracteres.');
  }
  if (Buffer.byteLength(password, 'utf8') < 10 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('DIRECTOR_PASSWORD debe tener entre 10 y 72 bytes.');
  }

  await prisma.usuario.upsert({
    where: { ci },
    update: {},
    create: {
      ci,
      name: name.trim(),
      password: await bcrypt.hash(password, 12),
      rol: UserRol.DIRECTOR,
    },
  });

  console.log('Cuenta DIRECTOR inicial creada (si no existía).');
}

main()
  .catch((error: unknown) => {
    console.error('Error al crear la cuenta inicial:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
