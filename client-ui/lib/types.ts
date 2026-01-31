export enum UserRole {
  ADMIN = 'ADMIN',
  OFFICER = 'OFFICER',
}

export enum SurveyType {
  TEXT = 'TEXT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  DROPDOWN = 'DROPDOWN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: SurveyType;
  options?: string[];
  isRequired?: boolean;
  order: number;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  value: string | string[];
}

export interface SubmitSurveyDto {
  surveyId: string;
  answers: Answer[];
}

export interface SubmittedAnswer {
  id: string;
  question: Question;
  questionId: string;
  responseId: string;
  value: string | string[];
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  survey: {
    id: string;
    title: string;
    description?: string;
  };
  answers: SubmittedAnswer[];
  submittedAt: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
