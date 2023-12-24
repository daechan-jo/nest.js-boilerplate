import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class JoinDataDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  passwordConfirm: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
