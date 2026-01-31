import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @MinLength(6)
  confirmPassword: string;
}
