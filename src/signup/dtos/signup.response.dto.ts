import { Expose } from 'class-transformer';

export class SignupResponseDTO {
  @Expose()
  id: number;
}
