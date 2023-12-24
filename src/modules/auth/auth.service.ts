import { Injectable } from '@nestjs/common';
import { CreatedUserDto } from './dto/createdUser.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserDto } from './dto/user.dto';
import { Repository } from 'typeorm';
import { User } from '../../entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinDataDto } from './dto/joinData.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  isValidPassword(joinDataDto: JoinDataDto): boolean {
    return joinDataDto.password === joinDataDto.passwordConfirm;
  }

  async createUser(createUserDto: CreatedUserDto): Promise<CreatedUserDto> {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const createUser = await this.userRepository.save(createUserDto);
    return plainToInstance(CreatedUserDto, createUser);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user: UserDto = await this.userService.getUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validatePayload(email: string): Promise<UserDto> {
    const user: UserDto = await this.userService.getUserByEmail(email);
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
