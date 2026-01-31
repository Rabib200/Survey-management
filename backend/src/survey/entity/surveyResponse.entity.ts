import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Survey } from './survey.entity';
import { Answer } from './answer.entity';

@Entity('survey_responses')
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Survey, (survey) => survey.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @Column({ name: 'survey_id' })
  surveyId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitted_by' })
  submittedBy: User;

  @OneToMany(() => Answer, (answer) => answer.response, { cascade: true })
  answers: Answer[];

  @Column({ name: 'submitted_by' })
  submittedById: string;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;
}
