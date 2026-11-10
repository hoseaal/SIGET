import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { prisma } from './config/prisma.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', modulo: 'SIGEA' });
});

async function startServer(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    app.listen(port, () => {
      console.log(`SIGEA API disponible en http://localhost:${port}`);
      console.log('Conexión a la base de datos establecida');
    });
  } catch (error) {
    console.error('No se pudo iniciar SIGEA o conectar con la base de datos:', error);
    process.exitCode = 1;
    await prisma.$disconnect();
  }
}

void startServer();
