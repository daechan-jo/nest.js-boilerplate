import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatedUserDto } from './dto/createdUser.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserDto } from '../user/dto/user.dto';
import { Repository } from 'typeorm';
import { User } from '../../entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinDataDto } from './dto/joinData.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserByEmail(email: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return plainToInstance(UserDto, user);
  }

  isValidPassword(joinData: JoinDataDto): boolean {
    return joinData.password === joinData.passwordConfirm;
  }

  async createUser(createUserData: CreatedUserDto): Promise<CreatedUserDto> {
    createUserData.password = await bcrypt.hash(createUserData.password, 10);
    const createUser = await this.userRepository.save(createUserData);
    return plainToInstance(CreatedUserDto, createUser);
  }

  async validateUser(email: string, password: string): Promise<UserDto> {
    const user: UserDto = await this.getUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async validatePayload(email: string): Promise<UserDto> {
    const user = await this.getUserByEmail(email);
    if (user) {
      return user;
    }
    return null;
  }

  async login(user: any): Promise<LoginUserDto> {
    const { username, id, email, nickname } = user;
    const payload = { username, id, email, nickname };
    const access_token: string = this.jwtService.sign(payload);

    const loginUser: LoginUserDto = {
      id: id,
      username: username,
      email: email,
      nickname: nickname,
      token: access_token,
    };

    return plainToInstance(LoginUserDto, loginUser);
  }
}
