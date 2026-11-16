import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { getJwtSecret } from './config/auth.js';
import { prisma } from './config/prisma.js';
import auditoriaRouter from './routes/auditoria.routes.js';
import authRouter from './routes/auth.routes.js';
import enteRouter from './routes/ente.routes.js';
import solicitudRouter from './routes/solicitud.routes.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/entes', enteRouter);
app.use('/api/auditorias', auditoriaRouter);
app.use('/api/solicitudes', solicitudRouter);

app.use((_request, response) => {
  response.status(404).json({ error: 'No se encontró el endpoint solicitado.' });
});

async function startServer() {
  try {
    getJwtSecret();
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
