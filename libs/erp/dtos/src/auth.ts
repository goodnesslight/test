import { IsEmail, IsString, Length } from 'class-validator';

export class AuthLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 64)
  password: string;
}

export class AuthRegisterDto {
  @IsString()
  @Length(16, 128)
  inviteToken: string;

  @IsString()
  @Length(8, 64)
  password: string;
}
