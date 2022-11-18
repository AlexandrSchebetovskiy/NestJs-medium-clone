import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class createUserDto{

  @IsNotEmpty()
  @IsEmail()
  readonly email:string

  @MinLength(6)
  @IsNotEmpty()
  readonly password:string

  @IsNotEmpty()
  readonly username: string
}