import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserInfo(userId: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async createOfficer(createUserDto: CreateUserDto) {
    const isEmailExists = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (isEmailExists) {
      throw new BadRequestException('Email already exists');
    }

    const passEncrypted = await bcrypt.hash(createUserDto.password, 10);

    createUserDto.password = passEncrypted;

    await this.userRepository.create(createUserDto);
    return await this.userRepository.save(createUserDto);
  }

  async login(loginDto: LoginDto) {
    const userEmail = await this.userRepository.findOne({
      where: {
        email: loginDto.email,
      },
    });

    if (!userEmail) {
      throw new BadRequestException('User not found');
    }

    if (userEmail.password != bcrypt.hash(loginDto.password, 10)) {
      throw new BadRequestException('Invalid password');
    }

    return userEmail;
  }

  //!-------Admin Services--------!

  async getAllUUsers(page: number = 1, limit: number = 10) {
    return await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
