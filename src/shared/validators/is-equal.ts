import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';

// Criar a lógica do validador
@ValidatorConstraint({ async: false })
export class IsEqualConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedField] = args.constraints;
    const object = args.object as Record<string, any>;
    return value === object[relatedField]; // Compara o valor do campo com o campo relacionado
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedField] = args.constraints;
    return `${args.property} deve ser igual a ${relatedField}`;
  }
}

// Decorador personalizado para utilizar o validador
export function IsEqual(property: string) {
  return Validate(IsEqualConstraint, [property]);
}
