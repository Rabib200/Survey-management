import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { SurveyResponse } from './surveyResponse.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Question, (question) => question.answers)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'question_id' })
  questionId: string;

  @ManyToOne(() => SurveyResponse, (surveyResponse) => surveyResponse.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'response_id' })
  response: SurveyResponse;

  @Column({ name: 'response_id' })
  responseId: string;

  @Column({ type: 'json' })
  value: string | string[];

  @CreateDateColumn()
  createdAt: Date;
}
