import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength, IsOptional } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  nombre?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  correo_electronico?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(6)
  contrasena?: string;
}
