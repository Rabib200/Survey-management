import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SurveyType } from 'libs/common/src/enums/surveyType.enum';
import { IsNull } from 'typeorm';

export class CreateQuestionDto {
  @ApiProperty({ description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    enum: SurveyType,
    description: 'Question type',
    example: SurveyType.TEXT,
  })
  @IsEnum(SurveyType)
  type: SurveyType;

  @ApiProperty({
    description: 'Options for checkbox, radio, or dropdown questions',
    required: false,
    type: [String],
    example: ['Option 1', 'Option 2', 'Option 3'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiProperty({
    description: 'Whether the question is required',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ description: 'Question order', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class CreateSurveyDto {
  @ApiProperty({
    description: 'Survey title',
    example: 'Customer Satisfaction Survey',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Survey description',
    required: false,
    example: 'Please provide your feedback on our services',
  })
  @IsString()
  @IsOptional()
  description?: string;

  createdBy: string;

  @ApiProperty({
    description: 'List of questions in the survey',
    type: [CreateQuestionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
