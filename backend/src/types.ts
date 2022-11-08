import { User } from "./entities/User";

/**
 * Dùng để lưu thông tin của user trong token
 */
export type JWTUserPayload = {
  username: string;
  account_type: User["account_type"];
};
