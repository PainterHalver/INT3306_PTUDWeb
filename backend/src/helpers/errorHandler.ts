import { ValidationError } from "class-validator";
import { Request, Response } from "express";
import { ZodError } from "zod/lib";

/**
 * Hàm xử lý lỗi không bắt được hoặc lặp lại nhiều lần trong controller.
 */
export const errorHandler = (error: unknown, req: Request, res: Response) => {
  console.log(error);

  // Lỗi validate của zod
  if (error instanceof Error && error.name === "ZodError") {
    const errors: any = {};
    (error as ZodError).errors.forEach((e: any) => {
      if (e.path.length > 0) {
        errors[e.path[0].toString()] = e.message;
      } else {
        errors["general"] = e.message;
      }
    });
    return res.status(400).json({ errors });
  }

  // Lỗi chưa bắt được khi validate dữ liệu trong controller
  if (Array.isArray(error) && error.every((e) => e instanceof ValidationError)) {
    const errors: any = {};
    (error as ValidationError[]).forEach((e) => {
      errors[e.property] = e.constraints ? Object.values(e.constraints)[0] : "";
    });
    return res.status(400).json({ errors });
  }

  // Lỗi chưa xác định
  return res.status(500).json({ error: "Lỗi hệ thống!" });
};
