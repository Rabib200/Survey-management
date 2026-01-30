import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class AdminJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(users: User) {
    const payload = { email: users.email, sub: users.id, role: users.role };
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string, ignoreExpiration: boolean = false) {
    try {
      return this.jwtService.verify(token, { ignoreExpiration });
    } catch (error) {
      if (ignoreExpiration && error.name === 'TokenExpiredError') {
        return this.jwtService.decode(token);
      }
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }

  decode(token: string) {
    return this.jwtService.decode(token);
  }
}
