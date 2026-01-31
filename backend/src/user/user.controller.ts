import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

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
}
