import * as enteService from '../services/ente.service.js';
import { HttpError, isRecord, parsePositiveInteger, sendControllerError } from '../utils/http-error.js';

function parseId(param) {
  const id = parsePositiveInteger(param);

  if (!id) {
    throw new HttpError(400, 'El identificador del ente no es válido.');
  }

  return id;
}

function assertBody(body) {
  if (!isRecord(body)) {
    throw new HttpError(400, 'El cuerpo de la solicitud debe ser un objeto JSON.');
  }
}

export async function createEnte(request, response) {
  try {
    assertBody(request.body);
    response.status(201).json(await enteService.createEnte(request.body));
  } catch (error) {
    sendControllerError(error, response, 'crear ente');
  }
}

export async function listEntes(_request, response) {
  try {
    response.json(await enteService.listEntes());
  } catch (error) {
    sendControllerError(error, response, 'listar entes');
  }
}

export async function updateEnte(request, response) {
  try {
    const id = parseId(request.params.id);
    assertBody(request.body);
    response.json(await enteService.updateEnte(id, request.body));
  } catch (error) {
    sendControllerError(error, response, 'actualizar ente');
  }
}

export async function deleteEnte(request, response) {
  try {
    const id = parseId(request.params.id);
    response.json(await enteService.deleteEnte(id));
  } catch (error) {
    sendControllerError(error, response, 'eliminar ente');
  }
}