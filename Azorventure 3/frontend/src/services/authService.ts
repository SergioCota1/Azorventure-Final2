import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  telefone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  telefone?: string;
  profileImage?: string;
  pontos: number;
  role: string;
  interesses?: {
    topicos: string[];
    subtopicos: string[];
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('Enviando dados de login:', data);
      const response = await api.post('/auth/login', data);
      console.log('Resposta do login:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Enviando dados de registro:', data);
      const response = await api.post('/auth/registar', data);
      console.log('Resposta do registro:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro no registro:', error.response?.data || error.message);
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();