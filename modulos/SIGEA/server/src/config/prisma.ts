import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Falta configurar DATABASE_URL en el archivo .env');
}

const databaseUrl = new URL(connectionString);

if (databaseUrl.protocol !== 'mysql:') {
  throw new Error('DATABASE_URL debe usar el protocolo mysql://');
}

const database = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''));

if (!database) {
  throw new Error('DATABASE_URL debe incluir el nombre de la base de datos');
}

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database,
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
