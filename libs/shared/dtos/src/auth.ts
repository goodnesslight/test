import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class AuthLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 64)
  password: string;
}

export class AuthRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message:
      'username can only contain letters, numbers, dots, dashes and underscores',
  })
  username: string;

  @IsString()
  @Length(8, 64)
  password: string;
}
