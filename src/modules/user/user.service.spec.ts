import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { UserListResponseDto } from './dto/userListResponse.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { NotFoundException } from '@nestjs/common';
import { User } from '../../entities/User';
import { Post } from '../../entities/Post';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockUserRepository = {
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const mockPostRepository = {
  find: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findUserById', () => {
    it('should find a user by ID', async () => {
      const userId = 1;
      const mockUser = { id: userId, username: 'testUser' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result: UserDto = await service.findUserById(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(expect.objectContaining(mockUser));
    });
  });

  describe('getUsers', () => {
    it('should get a list of users', async () => {
      const page = 1;
      const limit = 10;
      const mockUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
      ];

      mockUserRepository.findAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

      const result: UserListResponseDto = await service.getUsers(page, limit);

      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(
        expect.objectContaining({ users: mockUsers, totalPage: 1, currentPage: page }),
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = 1;
      const updateData: UpdateUserDto = {
        description: '',
        field: '',
        profileImg: '',
        username: 'updatedUser',
        nickname: 'updatedUser',
      };
      const mockUpdatedUser = { id: userId, username: 'updatedUser' };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue(mockUpdatedUser);

      const result: UserDto = await service.updateUser(userId, updateData);

      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(expect.objectContaining(mockUpdatedUser));
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 1;
      const updateData: UpdateUserDto = {
        description: '',
        field: '',
        profileImg: '',
        username: 'updatedUser',
        nickname: 'updatedUser',
      };

      mockUserRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.updateUser(userId, updateData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = 1;
      const mockPosts = [{ postId: 1, postImg: '/images/post1.jpg' }];
      const mockDeletedUser = {
        id: userId,
        username: 'deletedUser',
        profileImg: '/images/profile.jpg',
        backgroundImg: '/images/background.jpg',
      };

      mockPostRepository.find.mockResolvedValue(mockPosts);
      mockUserRepository.findOne.mockResolvedValue(mockDeletedUser);

      await service.deleteUser(userId);

      expect(mockPostRepository.find).toHaveBeenCalledWith({ where: { authorId: userId } });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });
});
