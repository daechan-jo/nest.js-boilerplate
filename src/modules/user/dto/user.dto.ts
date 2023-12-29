import {
  IsString,
  IsEmail,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDate,
  Length,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Like } from '../../../entities/Like';
import { Post } from '../../../entities/Post';

export class UserDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  username: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Length(1, 20)
  nickname?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Exclude()
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  snsId?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  profileImg?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsString()
  field?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty()
  post?: Post[];

  @IsOptional()
  @IsArray()
  @ApiProperty()
  like?: Like[];

  @IsOptional()
  @IsArray()
  @ApiProperty()
  comment?: Comment[];

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  manager!: boolean;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty()
  createdAt!: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty()
  updatedAt?: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty()
  deletedAt?: Date;
}
