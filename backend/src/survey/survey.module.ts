import { Module } from '@nestjs/common';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './entity/answer.entity';
import { Question } from './entity/question.entity';
import { SurveyResponse } from './entity/surveyResponse.entity';
import { Survey } from './entity/survey.entity';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Answer, Question, SurveyResponse, Survey, User]),
  ],
  controllers: [SurveyController],
  providers: [SurveyService],
})
export class SurveyModule {}
