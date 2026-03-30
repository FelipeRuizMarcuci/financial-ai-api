import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPhoneValid', async: false })
export class IsPhoneValidConstraint implements ValidatorConstraintInterface {
  validate(phone: string, _args: ValidationArguments) {
    return this.isValidPhone(phone);
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Número de telefone inválido! Deve conter 11 dígitos, incluindo DDD.';
  }

  private isValidPhone(phone: string): boolean {
    if (!phone) return false;

    phone = phone.replace(/\D/g, ''); // Remove caracteres não numéricos

    return phone.length === 11 || phone.length === 10;
  }
}

// Criando um decorador reutilizável
export function IsPhoneValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneValidConstraint,
    });
  };
}
