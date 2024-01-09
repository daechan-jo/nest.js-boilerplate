import path from 'path';
import fs from 'fs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/User';
import { Post } from '../../entities/Post';
import { UserListDto } from './dto/userList.dto';
import { UserListResponseDto } from './dto/userListResponse.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async findUserById(userId: number): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    return plainToInstance(UserDto, user);
  }

  async getUsers(page: number, limit: number): Promise<UserListResponseDto> {
    const [users, totalCount] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
    const totalPage: number = Math.ceil(totalCount / limit);

    return { users: plainToInstance(UserListDto, users), totalPage, currentPage: page };
  }

  async updateUser(userId: number, updateData: UpdateUserDto): Promise<UserDto> {
    const updateResult = await this.userRepository.update(userId, updateData);

    if (updateResult.affected === 0) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.findOne({ where: { id: userId } });

    return plainToInstance(UserDto, updatedUser);
  }

  async deleteUser(userId: number): Promise<void> {
    const serverUrl: string = process.env.SERVER_URL;

    const posts = await this.postRepository.find({
      where: { authorId: userId },
    });

    for (const post of posts) {
      if (post.postImg) {
        const relativeImagePath: string = post.postImg.replace(serverUrl, '').replace(/^\//, '');
        const absoluteImagePath: string = path.join(__dirname, '..', 'public', relativeImagePath);
        if (fs.existsSync(absoluteImagePath)) {
          fs.unlinkSync(absoluteImagePath);
        }
      }
    }
    const deletedUser = await this.userRepository.findOne({ where: { id: userId } });

    if (deletedUser.backgroundImg) {
      const relativeImagePath: string = deletedUser.backgroundImg
        .replace(serverUrl, '')
        .replace(/^\//, '');
      const absoluteImagePath: string = path.join(__dirname, '..', 'public', relativeImagePath);
      if (fs.existsSync(absoluteImagePath)) {
        fs.unlinkSync(absoluteImagePath);
      }
    }

    if (deletedUser.profileImg) {
      const relativeImagePath: string = deletedUser.profileImg
        .replace(serverUrl, '')
        .replace(/^\//, '');
      const absoluteImagePath: string = path.join(__dirname, '..', 'public', relativeImagePath);
      if (fs.existsSync(absoluteImagePath)) {
        fs.unlinkSync(absoluteImagePath);
      }
    }
    await this.userRepository.softDelete({ id: userId });
  }
}
