import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginUserInput {
  @Field()
  correo_electronico: string;

  @Field()
  contrasena: string;
}
