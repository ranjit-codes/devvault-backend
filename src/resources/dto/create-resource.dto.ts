import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export enum ResourceType {
  ARTICLE = 'ARTICLE',
  VIDEO = 'VIDEO',
  DOCUMENTATION = 'DOCUMENTATION',
}

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'Must be a valid URL' })
  @IsNotEmpty()
  url!: string;

  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
