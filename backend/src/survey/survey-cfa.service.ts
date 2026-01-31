import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Survey } from './entity/survey.entity';
import { Repository } from 'typeorm';
import { SubmitSurveyDto } from './dto/SubmitSurvey.dto';
import { User } from 'src/user/entity/user.entity';
import { SurveyResponse } from './entity/surveyResponse.entity';
import { Answer } from './entity/answer.entity';
import { Question } from './entity/question.entity';
import { UserRole } from 'libs/common/src/enums/user.roles.enum';
import { SurveyType } from 'libs/common/src/enums/surveyType.enum';

@Injectable()
export class SurveyCfaService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SurveyResponse)
    private readonly surveyResponseRepository: Repository<SurveyResponse>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async submitSurvey(userId: string, submitSurveyDto: SubmitSurveyDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.OFFICER) {
      throw new BadRequestException('Only officers can submit surveys');
    }

    const survey = await this.surveyRepository.findOne({
      where: { id: submitSurveyDto.surveyId },
      relations: ['questions'],
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }
    if (!survey.isActive) {
      throw new BadRequestException('This survey is no longer active');
    }

    const requiredQuestions = survey.questions.filter((q) => q.isRequired);
    const answeredQuestionIds = submitSurveyDto.answers.map(
      (a) => a.questionId,
    );

    for (const requiredQuestion of requiredQuestions) {
      if (!answeredQuestionIds.includes(requiredQuestion.id)) {
        throw new BadRequestException(
          `Required question "${requiredQuestion.text}" is not answered`,
        );
      }
    }

    const surveyQuestionIds = survey.questions.map((q) => q.id);
    for (const answer of submitSurveyDto.answers) {
      if (!surveyQuestionIds.includes(answer.questionId)) {
        throw new BadRequestException(
          `Question with ID ${answer.questionId} does not belong to this survey`,
        );
      }

      const question = survey.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      if (question.type === SurveyType.CHECKBOX) {
        if (!Array.isArray(answer.value)) {
          throw new BadRequestException(
            `Answer for checkbox question "${question.text}" must be an array`,
          );
        }
        if (question.options) {
          for (const selectedOption of answer.value as string[]) {
            if (!question.options.includes(selectedOption)) {
              throw new BadRequestException(
                `Invalid option "${selectedOption}" for question "${question.text}"`,
              );
            }
          }
        }
      }

      if ([SurveyType.RADIO, SurveyType.DROPDOWN].includes(question.type)) {
        if (Array.isArray(answer.value)) {
          throw new BadRequestException(
            `Answer for ${question.type.toLowerCase()} question "${question.text}" must be a string`,
          );
        }
        if (
          question.options &&
          !question.options.includes(answer.value as string)
        ) {
          throw new BadRequestException(
            `Invalid option "${answer.value}" for question "${question.text}"`,
          );
        }
      }

      if (question.type === SurveyType.TEXT) {
        if (Array.isArray(answer.value)) {
          throw new BadRequestException(
            `Answer for text question "${question.text}" must be a string`,
          );
        }
      }
    }

    const surveyResponse = this.surveyResponseRepository.create({
      surveyId: submitSurveyDto.surveyId,
      submittedById: userId,
      answers: submitSurveyDto.answers.map((answer) => ({
        questionId: answer.questionId,
        value: answer.value,
      })),
    });

    const savedResponse =
      await this.surveyResponseRepository.save(surveyResponse);

    return {
      message: 'Survey submitted successfully',
      responseId: savedResponse.id,
    };
  }

  async getActiveSurveysForOfficers() {
    return await this.surveyRepository.find({
      where: { isActive: true },
      relations: ['questions', 'createdBy'],
      select: {
        id: true,
        title: true,
        description: true,
        isActive: true,
        createdAt: true,
        createdBy: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: {
        createdAt: 'DESC',
        questions: {
          order: 'ASC',
        },
      },
    });
  }

  async getMySubmissions(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.surveyResponseRepository.find({
      where: { submittedById: userId },
      relations: ['survey', 'answers', 'answers.question'],
      select: {
        id: true,
        submittedAt: true,
        survey: {
          id: true,
          title: true,
          description: true,
        },
      },
      order: {
        submittedAt: 'DESC',
      },
    });
  }

  async getSubmissionById(userId: string, responseId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const response = await this.surveyResponseRepository.findOne({
      where: { id: responseId, submittedById: userId },
      relations: ['survey', 'answers', 'answers.question'],
    });

    if (!response) {
      throw new NotFoundException('Survey response not found');
    }

    return response;
  }
}
