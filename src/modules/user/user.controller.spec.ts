import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../../../typeorm.config';
import { User } from '../../entities/User';
import { JwtStrategy } from '../../passport/jwt.strategy';
import { UserDto } from './dto/user.dto';
import { Post } from '../../entities/Post';
import { AuthService } from '../auth/auth.service';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '24h' },
        }),
        TypeOrmModule.forRoot(typeOrmConfig),
        TypeOrmModule.forFeature([User, Post]),
      ],
      controllers: [UserController],
      providers: [UserService, JwtStrategy, AuthService],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('getMyInfo', () => {
    it('should return a my info', async () => {
      const mockUser: UserDto = {
        id: 1,
        username: 'testUser',
        email: 'testUser@example.com',
        nickname: 'testNickname',
        password: '1234',
        manager: false,
        createdAt: new Date(),
      };
      const mockReq = {
        user: mockUser,
      } as any;

      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);

      const result = await userController.getMyInfo(mockReq);

      expect(userService.findUserById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      const mockUser: UserDto = {
        createdAt: undefined,
        manager: false,
        password: 'test',
        id: 1,
        username: 'testUser',
        email: 'test',
      };

      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);

      const result = await userController.getUser(1);

      expect(userService.findUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getAllUsers', () => {
    it('should return a user list', async () => {
      const mockUserList = {
        users: [
          {
            createdAt: undefined,
            manager: false,
            password: 'test',
            id: 1,
            username: 'testUser',
            email: 'test',
          },
        ],
        totalPage: 1,
        currentPage: 1,
      };

      jest.spyOn(userService, 'getUsers').mockResolvedValue(mockUserList);

      const result = await userController.getAllUsers(1, 10);

      expect(userService.getUsers).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockUserList);
    });
  });

  describe('editUser', () => {
    it('should return a user', async () => {
      const mockUser: UserDto = {
        createdAt: undefined,
        manager: false,
        password: 'test',
        id: 1,
        username: 'testUser',
        email: 'test',
        nickname: 'test',
        profileImg: null,
        field: 'test',
        description: 'test',
      };
      const mockReq = {
        user: mockUser,
      } as any;
      const mockUpdateData = {
        username: 'update',
        email: 'update',
        nickname: 'update',
        profileImg: null,
        field: 'update',
        description: 'update',
      };
      jest.spyOn(userService, 'updateUser').mockResolvedValue(mockUser);

      const result = await userController.editUser(mockReq, mockUpdateData);

      expect(userService.updateUser).toHaveBeenCalledWith(mockUser.id, mockUpdateData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should return void', async () => {
      const mockUser: UserDto = {
        createdAt: undefined,
        manager: false,
        password: 'test',
        id: 1,
        username: 'testUser',
        email: 'test',
        nickname: 'test',
        profileImg: null,
        field: 'test',
        description: 'test',
      };
      const mockReq = {
        user: mockUser,
      } as any;
      jest.spyOn(userService, 'deleteUser').mockResolvedValue(undefined);

      const result = await userController.deleteUser(mockReq);

      expect(userService.deleteUser).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(undefined);
    });
  });
});
