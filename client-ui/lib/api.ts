import { AuthResponse, LoginDto, RegisterDto, Survey, SubmitSurveyDto, SurveyResponse, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Auth - Officer endpoints
  async register(data: RegisterDto): Promise<User> {
    const response = await fetch(`${API_URL}/cfa/user/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/cfa/user/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/cfa/user`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  // Surveys
  async getActiveSurveys(): Promise<Survey[]> {
    const response = await fetch(`${API_URL}/v1/survey-cfa/active`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Survey[]>(response);
  }

  async submitSurvey(data: SubmitSurveyDto): Promise<SurveyResponse> {
    const response = await fetch(`${API_URL}/v1/survey-cfa/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<SurveyResponse>(response);
  }

  async getMySubmissions(): Promise<SurveyResponse[]> {
    const response = await fetch(`${API_URL}/v1/survey-cfa/my-submissions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<SurveyResponse[]>(response);
  }

  async getSubmissionById(id: string): Promise<SurveyResponse> {
    const response = await fetch(`${API_URL}/v1/survey-cfa/submission/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<SurveyResponse>(response);
  }
}

export const api = new ApiClient();
