import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Min, MinLength } from 'class-validator';
import { UserRole } from 'libs/common/src/enums/user.roles.enum';

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

  role?: UserRole;

  @ApiProperty()
  @MinLength(6)
  confirmPassword: string;
}
