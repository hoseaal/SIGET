import { findCurrentUser, loginUser, registerUser } from '../services/auth.service.js';
import { HttpError, isRecord, sendControllerError } from '../utils/http-error.js';

export const register = async (request, response) => {
  try {
    if (!isRecord(request.body)) {
      throw new HttpError(400, 'El cuerpo de la solicitud debe ser un objeto JSON.');
    }

    const result = await registerUser(request.body);
    response.status(201).json(result);
  } catch (error) {
    sendControllerError(error, response, 'registrar usuario');
  }
};

export const login = async (request, response) => {
  try {
    if (!isRecord(request.body)) {
      throw new HttpError(400, 'El cuerpo de la solicitud debe ser un objeto JSON.');
    }

    const result = await loginUser({
      ci: request.body.ci,
      password: request.body.password,
    });
    response.json(result);
  } catch (error) {
    sendControllerError(error, response, 'iniciar sesión');
  }
};

export const currentUser = async (request, response) => {
  try {
    if (!request.authUser) {
      throw new HttpError(401, 'Se requiere una sesión válida.');
    }

    response.json({ user: await findCurrentUser(request.authUser.id) });
  } catch (error) {
    sendControllerError(error, response, 'consultar usuario actual');
  }
};
