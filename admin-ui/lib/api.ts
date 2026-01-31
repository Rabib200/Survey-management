import { AuthResponse, CreateSurveyDto, LoginDto, Survey, User } from './types';

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

  // Auth - Admin endpoints
  async register(data: Omit<LoginDto, 'email'> & { name: string; email: string; confirmPassword: string }): Promise<User> {
    const response = await fetch(`${API_URL}/user/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/user/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse<AuthResponse>(response);
    return result;
  }

  // Surveys
  async getAllSurveys(includeInactive = false): Promise<Survey[]> {
    const response = await fetch(
      `${API_URL}/v1/survey?includeInactive=${includeInactive}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<Survey[]>(response);
  }

  async getActiveSurveys(): Promise<Survey[]> {
    const response = await fetch(`${API_URL}/v1/survey/active`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Survey[]>(response);
  }

  async getSurveyById(id: string): Promise<Survey> {
    const response = await fetch(`${API_URL}/v1/survey/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Survey>(response);
  }

  async createSurvey(data: CreateSurveyDto): Promise<Survey> {
    const response = await fetch(`${API_URL}/v1/survey`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Survey>(response);
  }

  async updateSurvey(id: string, data: CreateSurveyDto): Promise<Survey> {
    const response = await fetch(`${API_URL}/v1/survey/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Survey>(response);
  }

  async toggleSurveyStatus(id: string): Promise<Survey> {
    const response = await fetch(`${API_URL}/v1/survey/${id}/toggle-status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Survey>(response);
  }

  async deleteSurvey(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/v1/survey/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete survey');
    }
  }

  async getSurveyResponses(id: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/v1/survey/${id}/responses`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any[]>(response);
  }
}

export const api = new ApiClient();
