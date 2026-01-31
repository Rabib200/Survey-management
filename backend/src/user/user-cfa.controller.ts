import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/auth/admin-auth.guard';
import { RolesGuard } from 'src/auth/roles.gurad';
import { UserRole } from 'libs/common/src/enums/user.roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginDto } from './dto/login.dto';

@Controller({
  path: 'cfa/user',
})
export class UserCfaController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(UserRole.OFFICER)
  async getUserInfo(@User() user: any) {
    return this.userService.getUserInfo(user.id);
  }

  @Post('register')
  async createOfficer(@Body() createUserDto: CreateUserDto) {
    return this.userService.createOfficer(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginDto) {
    return this.userService.login(loginUserDto);
  }
}
