import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { isAccountType, isProductStatus } from "./types";

/**
 * Validator kiểm tra property này là User thuộc loại san_xuat
 */
@ValidatorConstraint({ name: "IsSanXuatUser", async: true })
export class IsSanXuatUser implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value?.account_type) return true;
    return value.account_type === "san_xuat";
  }
}

/**
 * Validator kiểm tra property này là User thuộc loại dai_ly
 */
@ValidatorConstraint({ name: "IsDaiLyUser", async: true })
export class IsDaiLyUser implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value?.account_type) return true;
    return value.account_type === "dai_ly";
  }
}

/**
 * Validator kiểm tra property này là User thuộc loại bao_hanh
 */
@ValidatorConstraint({ name: "IsBaoHanhUser", async: true })
export class IsBaoHanhUser implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value?.account_type) return true;
    return value.account_type === "bao_hanh";
  }
}

/**
 * Validator kiểm tra property này là một loại tài khoản hợp lệ
 */
@ValidatorConstraint({ name: "IsAccountType", async: false })
export class IsAccountType implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return isAccountType(value);
  }
}

/**
 * Validator kiểm tra property này là một trạng thái sản phẩm hợp lệ
 */
@ValidatorConstraint({ name: "IsProductStatus", async: false })
export class IsProductStatus implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return isProductStatus(value);
  }
}

/**
 * Đảm bảo một property khác đã tồn tại trước khi thêm property này
 * @param property Tên thuộc tính của class
 */
export function RequireProperty(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "requireProperty",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (value === null || value === undefined) {
            return true;
          }
          return relatedValue !== null && relatedValue !== undefined && relatedValue !== 0;
        },
      },
    });
  };
}
