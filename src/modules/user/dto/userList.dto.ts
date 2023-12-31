import {
  IsString,
  IsEmail,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDate,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserListDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Exclude()
  password: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  @Exclude()
  snsId?: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  @Exclude()
  provider?: string;

  @IsOptional()
  @ApiProperty()
  profileImg?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  field?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty()
  @Exclude()
  subscribe?: [];

  @IsOptional()
  @IsArray()
  @ApiProperty()
  @Exclude()
  post?: [];

  @IsOptional()
  @IsArray()
  @ApiProperty()
  @Exclude()
  comment?: [];

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  @Exclude()
  manager!: boolean;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty()
  @Exclude()
  createdAt!: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty()
  @Exclude()
  updatedAt?: Date;
}
