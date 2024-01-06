import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JoinDataDto } from './dto/joinData.dto';
import { CreatedUserDto } from './dto/createdUser.dto';
import { HttpException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/User';
import { LocalStrategy } from '../../passport/local.strategy';
import { Post } from '../../entities/Post';
import { typeOrmConfig } from '../../../typeorm.config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

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
      controllers: [AuthController, LocalStrategy],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('createUser', () => {
    it('should create a user and return the created user', async () => {
      const joinData: JoinDataDto = {
        /* mock 데이터 입력 */
        username: 'test',
        password: '1234',
        passwordConfirm: '1234',
        email: 'test@gmail.com',
      };
      const createdUser: CreatedUserDto = {
        /* mock 데이터 입력 */
        username: 'test',
        password: '1234',
        email: 'test@gmail.com',
      };

      jest.spyOn(authService, 'isValidPassword').mockReturnValue(true);
      jest.spyOn(authService, 'createUser').mockResolvedValue(createdUser);

      const result: CreatedUserDto = await controller.createUser(joinData);

      expect(result).toEqual(createdUser);
      expect(authService.isValidPassword).toHaveBeenCalledWith(joinData);
      const { passwordConfirm, ...expectedCreateUserDto } = joinData;
      expect(authService.createUser).toHaveBeenCalledWith(expectedCreateUserDto);
    });

    it('should throw HttpException when passwords do not match', async () => {
      const joinData: JoinDataDto = {
        /* mock 데이터 입력 */
        username: 'test',
        password: '1234',
        passwordConfirm: '1234',
        email: 'test@gmail.com',
      };

      jest.spyOn(authService, 'isValidPassword').mockReturnValue(false);

      await expect(controller.createUser(joinData)).rejects.toThrow(
        new HttpException('Passwords do not match', 400),
      );
      expect(authService.isValidPassword).toHaveBeenCalledWith(joinData);
    });
  });

  // Add more tests for other controller methods (e.g., login) if needed
});
