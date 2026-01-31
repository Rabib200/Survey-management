import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { UserRole } from 'libs/common/src/enums/user.roles.enum';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}
