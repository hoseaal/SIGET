import { ZodError } from 'zod';

export const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: error.errors.map(err => ({
          field: err.path ? err.path.join('.') : 'root',
          message: err.message
        }))
      });
    }
    return res.status(500).json({ error: "Error en la validación" });
  }
};
