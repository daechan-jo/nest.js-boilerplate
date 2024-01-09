import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/User';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { JoinDataDto } from './dto/joinData.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test_token'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('getUserByEmail', () => {
    it('should return a user if one is found', async () => {
      const testUser: User = new User();
      testUser.email = 'test@test.com';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(testUser);

      const foundUser = await authService.getUserByEmail('test@test.com');
      expect(foundUser).toEqual(testUser);
    });

    it('should throw an error if no user is found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(authService.getUserByEmail('test@test.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('isValidPassword', () => {
    it('should return true if passwords match', () => {
      const joinData: JoinDataDto = {
        password: 'test',
        passwordConfirm: 'test',
        username: 'test',
        email: 'test@test',
      };
      jest.spyOn(authService, 'isValidPassword').mockReturnValue(true);
      expect(authService.isValidPassword(joinData)).toBe(true);
    });
  });

  describe('createUser', () => {
    it('should return a user if one is created', async () => {
      const testUser = new User();
      testUser.email = 'test@test';
      testUser.password = 'test';
      testUser.username = 'test';
      testUser.nickname = 'test';

      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      jest.spyOn(userRepository, 'save').mockImplementation(async (user): Promise<any> => {
        user.password = hashedPassword;
        return user;
      });
      const createdUser = await authService.createUser(testUser);

      expect(createdUser.email).toEqual(testUser.email);
      expect(createdUser.username).toEqual(testUser.username);
    });
  });

  describe('validate', () => {
    it('should return a user if one is found', async () => {
      const user: User = new User();
      user.email = 'test';

      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(user);
      const foundUser = await authService.validatePayload('test');
      expect(foundUser).toEqual(user);
    });
    it('should return null if no user is found', async () => {
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(null);
      const foundUser = await authService.validatePayload('test');
      expect(foundUser).toBeNull();
    });

    it('should return a user if the payload is valid', async () => {
      const user: User = new User();
      user.email = 'test';
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(user);
      const foundUser = await authService.validatePayload('test');
      expect(foundUser).toEqual(user);
    });
    it('should return null if the payload is invalid', async () => {
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(null);
      const foundUser = await authService.validatePayload('test');
      expect(foundUser).toBeNull();
    });
  });
  describe('login', () => {
    it('should return a LoginUserDto with a valid token', async () => {
      const testUser = {
        username: 'test',
        id: 1,
        email: 'test',
        nickname: 'test',
      };
      const expectedPayload = {
        username: testUser.username,
        id: testUser.id,
        email: testUser.email,
        nickname: testUser.nickname,
      };
      jest.spyOn(jwtService, 'sign').mockImplementation(() => 'testToken');
      const result = await authService.login(testUser);

      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
      expect(result).toHaveProperty('token', 'testToken');
      expect(result).toHaveProperty('id', testUser.id);
      expect(result).toHaveProperty('username', testUser.username);
      expect(result).toHaveProperty('email', testUser.email);
      expect(result).toHaveProperty('nickname', testUser.nickname);
    });
  });
});
