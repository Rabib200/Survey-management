import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller({
  path: 'user',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUser() {
    return;
  }
}
