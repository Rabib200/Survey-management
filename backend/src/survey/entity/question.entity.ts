import { SurveyType } from 'libs/common/src/enums/surveyType.enum';
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
import { Survey } from './survey.entity';
import { Answer } from './answer.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Survey, (survey) => survey.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @Column({ name: 'survey_id' })
  surveyId: string;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @Column()
  text: string;

  @Column({
    type: 'enum',
    enum: SurveyType,
  })
  type: SurveyType;

  @Column({ type: 'json', nullable: true })
  options: string[];

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
