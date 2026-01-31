import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SurveyCfaService } from './survey-cfa.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/auth/admin-auth.guard';
import { RolesGuard } from 'src/auth/roles.gurad';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'libs/common/src/enums/user.roles.enum';
import { User } from 'src/auth/decorators/user.decorator';
import { SubmitSurveyDto } from './dto/SubmitSurvey.dto';

@ApiTags('Survey - Officer')
@ApiBearerAuth()
@Controller({
  path: 'survey-cfa',
  version: '1',
})
@UseGuards(AdminAuthGuard, RolesGuard)
export class SurveyCfaController {
  constructor(private readonly surveyCfaService: SurveyCfaService) {}

  @Get('active')
  @Roles(UserRole.OFFICER)
  @ApiOperation({ summary: 'Get all active surveys for officers to submit' })
  async getActiveSurveysForOfficers() {
    return await this.surveyCfaService.getActiveSurveysForOfficers();
  }

  @Post('submit')
  @Roles(UserRole.OFFICER)
  @ApiOperation({ summary: 'Submit a survey response (Officer only)' })
  async submitSurvey(
    @User() user: any,
    @Body() submitSurveyDto: SubmitSurveyDto,
  ) {
    return await this.surveyCfaService.submitSurvey(user.id, submitSurveyDto);
  }

  @Get('my-submissions')
  @Roles(UserRole.OFFICER)
  @ApiOperation({ summary: 'Get my survey submissions' })
  async getMySubmissions(@User() user: any) {
    return await this.surveyCfaService.getMySubmissions(user.id);
  }

  @Get('submission/:id')
  @Roles(UserRole.OFFICER)
  @ApiOperation({ summary: 'Get a specific submission by ID' })
  async getSubmissionById(@User() user: any, @Param('id') id: string) {
    return await this.surveyCfaService.getSubmissionById(user.id, id);
  }
}
