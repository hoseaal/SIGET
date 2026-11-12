import type { UserRol } from '../generated/prisma/enums.js';

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: number;
        rol: UserRol;
      };
    }
  }
}

export {};
