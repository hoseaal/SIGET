import type { Response } from 'express';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

function isPrismaError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error &&
    typeof error.code === 'string';
}

export function sendControllerError(
  error: unknown,
  response: Response,
  operation: string,
): void {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message });
    return;
  }

  if (isPrismaError(error)) {
    if (error.code === 'P2002') {
      response.status(409).json({ error: 'Ya existe un registro con esos datos.' });
      return;
    }

    if (error.code === 'P2003') {
      response.status(409).json({ error: 'El registro está relacionado con otros datos.' });
      return;
    }

    if (error.code === 'P2025') {
      response.status(404).json({ error: 'No se encontró el registro solicitado.' });
      return;
    }
  }

  console.error(`Error al ${operation}:`, error);
  response.status(500).json({ error: 'Ocurrió un error interno.' });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parsePositiveInteger(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value :
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;

  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 2_147_483_647
    ? parsed
    : null;
}
