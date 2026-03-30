import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';

// RegEx para garantir que a senha tenha pelo menos 8 caracteres, 1 número e 1 caractere especial
const passwordRegex =
  /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Za-z]).{8,}$/;

@ValidatorConstraint({ async: false })
export class PasswordStrengthConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string, _args: ValidationArguments): boolean {
    return passwordRegex.test(value); // Verifica se a senha atende ao padrão
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} deve ter pelo menos 8 caracteres, 1 número e 1 caractere especial`;
  }
}

// Decorador personalizado para utilizar o validador
export function IsStrongPassword() {
  return Validate(PasswordStrengthConstraint);
}
