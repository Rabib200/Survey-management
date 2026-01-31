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
  id?: string;
  text: string;
  type: SurveyType;
  options?: string[];
  isRequired?: boolean;
  order?: number;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  questions: Question[];
  createdBy?: User;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurveyDto {
  title: string;
  description?: string;
  questions: Omit<Question, 'id'>[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
