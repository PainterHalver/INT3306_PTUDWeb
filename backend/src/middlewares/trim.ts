import { NextFunction, Request, Response } from "express";

/**
 * Xóa khoảng trắng ở đầu và cuối của các string trong body trừ các trường được
 * định nghĩa trong `exceptions` array
 */
export default (req: Request, res: Response, next: NextFunction) => {
  const exceptions = ["password"];

  Object.keys(req.body).forEach((key) => {
    if (typeof req.body[key] === "string" && !exceptions.includes(key)) {
      req.body[key] = req.body[key].trim();
    }
  });

  next();
};
