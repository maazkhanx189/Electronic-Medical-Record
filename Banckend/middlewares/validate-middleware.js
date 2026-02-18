import { z } from "zod/v4";

const validate = (schema) => async (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        msg: "Validation failed",
        errors: error.errors ? error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })) : [{ field: "unknown", message: error.message }],
      });
    }
    next(error);
  }
};

export default validate;
