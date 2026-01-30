import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { readFileSync } from 'fs';
import _ from 'lodash';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { join } from 'path';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor() {
    const pathToKey = join(
      process.cwd(),
      'src/resources/public-keys',
      'admin.public.key',
    );

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: readFileSync(pathToKey, 'utf8'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
