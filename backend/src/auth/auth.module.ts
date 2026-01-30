import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminStrategy } from './auth.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [],
      useFactory: async () => {
        const privateKey = readFileSync(
          join(process.cwd(), 'src/resources/private-keys/admin.private.key'),
          'utf8',
        );

        const publicKey = readFileSync(
          join(process.cwd(), 'src/resources/public-keys/admin.public.key'),
          'utf8',
        );
        return {
          privateKey,
          publicKey,
          signOptions: { algorithm: 'RS256', expiresIn: '1h' },
        };
      },
    }),
  ],
  controllers: [],
  providers: [AdminAuthGuard, AdminStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
