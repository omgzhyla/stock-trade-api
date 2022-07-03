import {
  ValidationError,
  NotFoundError,
  DBError,
  ConstraintViolationError,
  UniqueViolationError,
  NotNullViolationError,
  ForeignKeyViolationError,
  CheckViolationError,
  DataError,
} from "objection";

export type ErrorReply = {
  code: number;
  message: string;
  logMessage?: string;
};

export function errorHandler(err: Error): ErrorReply {
  if (err instanceof ValidationError) {
    return {
      code: 400,
      message: "Validation error",
      logMessage: err.message,
    };
  } else if (err instanceof NotFoundError) {
    return {
      code: 404,
      message: "Record not found",
      logMessage: err.message,
    };
  } else if (err instanceof UniqueViolationError) {
    // return { code: 409, message: err.message };
    return {
      code: 400,
      message: "Unique violation error.",
      logMessage: err.message,
    };
  } else if (err instanceof NotNullViolationError) {
    return { code: 400, message: err.message };
  } else if (err instanceof ForeignKeyViolationError) {
    // return { code: 409, message: err.message };
    return { code: 400, message: err.message };
  } else if (err instanceof ConstraintViolationError) {
    // return { code: 409, message: err.message };
    return { code: 400, message: err.message };
  } else if (err instanceof CheckViolationError) {
    return { code: 400, message: err.message };
  } else if (err instanceof DataError) {
    return { code: 400, message: err.message };
  } else if (err instanceof DBError) {
    return { code: 500, message: err.message };
  } else {
    return { code: 500, message: err.message };
  }
}
