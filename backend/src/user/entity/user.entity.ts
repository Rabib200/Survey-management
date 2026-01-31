import { UserRole } from 'libs/common/src/enums/user.roles.enum';
import { SurveyResponse } from 'src/survey/entity/surveyResponse.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'password' })
  password: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.OFFICER,
  })
  role: UserRole;

  @OneToMany(
    () => SurveyResponse,
    (surveyResponse) => surveyResponse.submittedBy,
  )
  responses: SurveyResponse[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
