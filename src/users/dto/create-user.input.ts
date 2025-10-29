import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field({ nullable: true })
  nombre?: string;

  @Field()
  @IsEmail()
  correo_electronico: string;

  @Field()
  @MinLength(6)
  contrasena: string;
}
