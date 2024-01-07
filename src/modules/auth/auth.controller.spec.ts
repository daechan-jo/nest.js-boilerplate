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
      controllers: [AuthController],
      providers: [AuthService, LocalStrategy],
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
        email: 'test@test.com',
      };
      const createdUser: CreatedUserDto = {
        /* mock 데이터 입력 */
        username: 'test',
        password: '1234',
        email: 'test@test.com',
      };

      // 해당 메서드가 호출될 대 반환시킬 값을 지정
      jest.spyOn(authService, 'isValidPassword').mockReturnValue(true);
      jest.spyOn(authService, 'createUser').mockResolvedValue(createdUser);

      const result: CreatedUserDto = await controller.createUser(joinData);

      expect(result).toEqual(createdUser);
      expect(authService.isValidPassword).toHaveBeenCalledWith(joinData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordConfirm, ...expectedCreateUserDto } = joinData;
      expect(authService.createUser).toHaveBeenCalledWith(expectedCreateUserDto);
    });

    it('should throw HttpException when passwords do not match', async () => {
      const joinData: JoinDataDto = {
        /* mock 데이터 입력 */
        username: 'test',
        password: '1234',
        passwordConfirm: '1234',
        email: 'test@test.com',
      };

      jest.spyOn(authService, 'isValidPassword').mockReturnValue(false);

      await expect(controller.createUser(joinData)).rejects.toThrow(
        new HttpException('Passwords do not match', 400),
      );
      expect(authService.isValidPassword).toHaveBeenCalledWith(joinData);
    });
  });
});
