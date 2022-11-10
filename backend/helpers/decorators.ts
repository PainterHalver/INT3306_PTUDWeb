import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { isAccountType, isProductStatus } from "./types";
@ValidatorConstraint({ name: "IsSanXuatUser", async: true })
export class IsSanXuatUser implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value?.account_type) return true;
    return value.account_type === "san_xuat";
  }
}

@ValidatorConstraint({ name: "IsDaiLyUser", async: true })
export class IsDaiLyUser implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value?.account_type) return true;
    return value.account_type === "dai_ly";
  }
}

@ValidatorConstraint({ name: "IsBaoHanhUser", async: true })
export class IsBaoHanhUser implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value?.account_type) return true;
    return value.account_type === "bao_hanh";
  }
}

@ValidatorConstraint({ name: "IsAccountType", async: false })
export class IsAccountType implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return isAccountType(value);
  }
}

@ValidatorConstraint({ name: "IsProductStatus", async: false })
export class IsProductStatus implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return isProductStatus(value);
  }
}
