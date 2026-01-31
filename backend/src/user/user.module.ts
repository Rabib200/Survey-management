import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserCfaController } from './user-cfa.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AdminJwtService } from 'src/auth/admin-jwt.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UserController, UserCfaController],
  providers: [UserService, AdminJwtService],
})
export class UserModule {}
