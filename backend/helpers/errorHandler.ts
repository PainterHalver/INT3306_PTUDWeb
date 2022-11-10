import { ValidationError } from "class-validator";
import { Request, Response } from "express";

/**
 * Hàm xử lý lỗi không bắt được hoặc lặp lại nhiều lần trong controller.
 */
export const errorHandler = (error: unknown, req: Request, res: Response) => {
  console.log(error);

  // Lỗi chưa bắt được khi validate dữ liệu trong controller
  if (Array.isArray(error) && error.every((e) => e instanceof ValidationError)) {
    const errors: any = {};
    (error as ValidationError[]).forEach((e) => {
      errors[e.property] = e.constraints ? Object.values(e.constraints)[0] : "";
    });
    return res.status(400).json({ error: errors });
  }

  // Lỗi chưa xác định
  return res.status(500).json({ error: "Lỗi hệ thống!" });
};
