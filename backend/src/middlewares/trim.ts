import { NextFunction, Request, Response } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  const exceptions = ["password"];

  Object.keys(req.body).forEach((key) => {
    if (typeof req.body[key] === "string" && !exceptions.includes(key)) {
      req.body[key] = req.body[key].trim();
    }
  });

  next();
};
