import * as solicitudService from '../services/solicitud.service.js';
import { HttpError, isRecord, parsePositiveInteger, sendControllerError } from '../utils/http-error.js';

function parseId(param) {
  const id = parsePositiveInteger(param);

  if (!id) {
    throw new HttpError(400, 'El identificador del detalle no es válido.');
  }

  return id;
}

function assertBody(body) {
  if (!isRecord(body)) {
    throw new HttpError(400, 'El cuerpo de la solicitud debe ser un objeto JSON.');
  }
}

export async function createSolicitud(request, response) {
  try {
    assertBody(request.body);
    response.status(201).json(await solicitudService.createSolicitud(request.body));
  } catch (error) {
    sendControllerError(error, response, 'crear solicitud');
  }
}

export async function listSolicitudes(_request, response) {
  try {
    response.json(await solicitudService.listSolicitudes());
  } catch (error) {
    sendControllerError(error, response, 'listar solicitudes');
  }
}

export async function answerDetail(request, response) {
  try {
    const id = parseId(request.params.id);
    assertBody(request.body);
    response.status(201).json(await solicitudService.answerDetail(id, request.body));
  } catch (error) {
    sendControllerError(error, response, 'responder detalle');
  }
}

export async function ratifyDetail(request, response) {
  try {
    const id = parseId(request.params.id);
    const { created, body } = await solicitudService.ratifyDetail(id);
    response.status(created ? 201 : 200).json(body);
  } catch (error) {
    sendControllerError(error, response, 'ratificar detalle');
  }
}