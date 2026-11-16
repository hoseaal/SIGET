import * as auditoriaService from '../services/auditoria.service.js';
import { HttpError, isRecord, parsePositiveInteger, sendControllerError } from '../utils/http-error.js';

function parseId(param) {
  const id = parsePositiveInteger(param);

  if (!id) {
    throw new HttpError(400, 'El identificador de la auditoría no es válido.');
  }

  return id;
}

function assertBody(body) {
  if (!isRecord(body)) {
    throw new HttpError(400, 'El cuerpo de la solicitud debe ser un objeto JSON.');
  }
}

export async function createAuditoria(request, response) {
  try {
    assertBody(request.body);
    response.status(201).json(await auditoriaService.createAuditoria(request.body));
  } catch (error) {
    sendControllerError(error, response, 'crear auditoría');
  }
}

export async function listAuditorias(_request, response) {
  try {
    response.json(await auditoriaService.listAuditorias());
  } catch (error) {
    sendControllerError(error, response, 'listar auditorías');
  }
}

export async function updateAuditoria(request, response) {
  try {
    const id = parseId(request.params.id);
    assertBody(request.body);
    response.json(await auditoriaService.updateAuditoria(id, request.body));
  } catch (error) {
    sendControllerError(error, response, 'actualizar auditoría');
  }
}

export async function deleteAuditoria(request, response) {
  try {
    const id = parseId(request.params.id);
    response.json(await auditoriaService.deleteAuditoria(id));
  } catch (error) {
    sendControllerError(error, response, 'eliminar auditoría');
  }
}