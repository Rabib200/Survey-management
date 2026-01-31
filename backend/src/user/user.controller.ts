import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginDto } from './dto/login.dto';

@Controller({
  path: 'user',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUser() {
    return this.userService;
  }

  @Get(':id')
  async getUserInfo(@Param('id') id: string) {
    return this.userService.getUserInfo(id);
  }

  @Post('register')
  async createNewAdmin(@Body() createUserDto: CreateUserDto) {
    return this.userService.createAdmin(createUserDto);
  }

  @Post('login')
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }
}
