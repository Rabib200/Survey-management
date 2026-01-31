import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/auth/admin-auth.guard';
import { RolesGuard } from 'src/auth/roles.gurad';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'libs/common/src/enums/user.roles.enum';
import { User } from 'src/auth/decorators/user.decorator';
import { CreateSurveyDto } from './dto/createSurvey.dto';

@ApiTags('Survey - Admin')
@ApiBearerAuth()
@Controller({
  path: 'survey',
  version: '1',
})
@UseGuards(AdminAuthGuard, RolesGuard)
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new survey (Admin only)' })
  async createSurvey(
    @User() user: any,
    @Body() createSurveyDto: CreateSurveyDto,
  ) {
    return await this.surveyService.createSurvey(user.id, createSurveyDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all surveys (Admin only)' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive surveys',
  })
  async getAllSurveys(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return await this.surveyService.getAllSurveys(include);
  }

  @Get('active')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all active surveys (Admin only)' })
  async getActiveSurveys() {
    return await this.surveyService.getActiveSurveys();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get survey by ID (Admin only)' })
  async getSurveyById(@Param('id') id: string) {
    return await this.surveyService.getSurveyById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a survey (Admin only)' })
  async updateSurvey(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateSurveyDto: CreateSurveyDto,
  ) {
    return await this.surveyService.updateSurvey(user.id, id, updateSurveyDto);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate/Deactivate a survey (Admin only)' })
  async toggleSurveyStatus(@User() user: any, @Param('id') id: string) {
    return await this.surveyService.toggleSurveyStatus(user.id, id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a survey (Admin only)' })
  async deleteSurvey(@User() user: any, @Param('id') id: string) {
    return await this.surveyService.deleteSurvey(user.id, id);
  }

  @Get(':id/responses')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all responses for a survey (Admin only)' })
  async getSurveyResponses(@Param('id') id: string) {
    return await this.surveyService.getSurveyResponses(id);
  }
}
