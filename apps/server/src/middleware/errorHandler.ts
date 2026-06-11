import { Request, Response, NextFunction } from "express";
import { CustomError } from "./customError";

// Express 4 以「4 參數」辨識錯誤處理中介層，少了 next 會被當成一般 middleware 而失效
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleError(err: CustomError, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(req.method, req.path, err.stack);
  res.status(statusCode).json({ status: "Error", message: message });
}
