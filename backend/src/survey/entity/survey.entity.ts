import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { SurveyResponse } from './surveyResponse.entity';
import { User } from '../../user/entity/user.entity';

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Question, (question) => question.survey, { cascade: true })
  questions: Question[];

  @OneToMany(() => SurveyResponse, (surveyResponse) => surveyResponse.survey)
  responses: SurveyResponse[];

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
