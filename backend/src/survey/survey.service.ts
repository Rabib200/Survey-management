import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { Survey } from './entity/survey.entity';
import { CreateSurveyDto } from './dto/createSurvey.dto';
import { UserRole } from 'libs/common/src/enums/user.roles.enum';
import { Question } from './entity/question.entity';
import { SurveyType } from 'libs/common/src/enums/surveyType.enum';
import { SurveyResponse } from './entity/surveyResponse.entity';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(SurveyResponse)
    private readonly surveyResponseRepository: Repository<SurveyResponse>,
  ) {}

  async createSurvey(userId: string, createSurveyDto: CreateSurveyDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only admins can create surveys');
    }

    for (const question of createSurveyDto.questions) {
      if (
        ['CHECKBOX', 'RADIO', 'DROPDOWN'].includes(question.type) &&
        (!question.options || question.options.length === 0)
      ) {
        throw new BadRequestException(
          `Question "${question.text}" requires options for type ${question.type}`,
        );
      }
    }

    const survey = this.surveyRepository.create({
      title: createSurveyDto.title,
      description: createSurveyDto.description,
      createdById: userId,
      questions: createSurveyDto.questions,
    });

    return await this.surveyRepository.save(survey);
  }

  async getAllSurveys(includeInactive = false) {
    const queryBuilder = this.surveyRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.questions', 'questions')
      .leftJoinAndSelect('survey.createdBy', 'createdBy')
      .orderBy('survey.createdAt', 'DESC')
      .addOrderBy('questions.order', 'ASC');

    if (!includeInactive) {
      queryBuilder.where('survey.isActive = :isActive', { isActive: true });
    }

    return await queryBuilder.getMany();
  }

  async getSurveyById(surveyId: string) {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['questions', 'createdBy'],
      order: {
        questions: {
          order: 'ASC',
        },
      },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    return survey;
  }

  async updateSurvey(
    userId: string,
    surveyId: string,
    updateSurveyDto: CreateSurveyDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only admins can update surveys');
    }

    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['questions', 'responses'],
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    // Check if survey has responses
    if (survey.responses && survey.responses.length > 0) {
      throw new BadRequestException(
        'Cannot update a survey that has already received responses. Please create a new survey instead.',
      );
    }

    for (const question of updateSurveyDto.questions) {
      if (
        [SurveyType.CHECKBOX, SurveyType.RADIO, SurveyType.DROPDOWN].includes(
          question.type,
        ) &&
        (!question.options || question.options.length === 0)
      ) {
        throw new BadRequestException(
          `Question "${question.text}" requires options for type ${question.type}`,
        );
      }
    }

    if (survey.questions && survey.questions.length > 0) {
      await this.questionRepository.remove(survey.questions);
    }

    survey.title = updateSurveyDto.title;
    survey.description = updateSurveyDto.description ?? survey.description;
    survey.questions = this.questionRepository.create(
      updateSurveyDto.questions.map((q) => ({ ...q, surveyId })),
    );

    return await this.surveyRepository.save(survey);
  }

  async toggleSurveyStatus(userId: string, surveyId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== UserRole.ADMIN) {
      throw new BadRequestException(
        'Only admins can activate/deactivate surveys',
      );
    }

    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    survey.isActive = !survey.isActive;
    return await this.surveyRepository.save(survey);
  }

  async deleteSurvey(userId: string, surveyId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only admins can delete surveys');
    }

    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['responses'],
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    // Check if survey has responses
    if (survey.responses && survey.responses.length > 0) {
      throw new BadRequestException(
        'Cannot delete a survey that has received responses. You can deactivate it instead.',
      );
    }

    await this.surveyRepository.remove(survey);
    return { message: 'Survey deleted successfully' };
  }

  async getActiveSurveys() {
    return await this.surveyRepository.find({
      where: { isActive: true },
      relations: ['questions'],
      order: {
        createdAt: 'DESC',
        questions: {
          order: 'ASC',
        },
      },
    });
  }

  async getSurveyResponses(surveyId: string) {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    const responses = await this.surveyResponseRepository.find({
      where: { surveyId },
      relations: ['submittedBy', 'answers', 'answers.question'],
      order: {
        submittedAt: 'DESC',
        answers: {
          question: {
            order: 'ASC',
          },
        },
      },
    });

    return responses;
  }
}
