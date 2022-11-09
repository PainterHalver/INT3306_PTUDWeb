import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: "IsSanXuatUser", async: true })
export class IsSanXuatUser implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return value.account_type === "san_xuat";
  }
}

@ValidatorConstraint({ name: "IsDaiLyUser", async: true })
export class IsDaiLyUser implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return value.account_type === "dai_ly";
  }
}

@ValidatorConstraint({ name: "IsBaoHanhUser", async: true })
export class IsBaoHanhUser implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return value.account_type === "bao_hanh";
  }
}
