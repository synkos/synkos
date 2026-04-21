import api from './api';
import type {
  AuthResponse,
  ForgotPasswordDto,
  ForgotPasswordResult,
  LoginDto,
  OAuthDto,
  RegisterDto,
  ResetPasswordDto,
  TokenPair,
} from 'src/types/auth';

export const AuthService = {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', dto);
    return res.data.data;
  },

  async loginEmail(dto: LoginDto): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', dto);
    return res.data.data;
  },

  async loginGoogle(dto: OAuthDto): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/google', dto);
    return res.data.data;
  },

  async loginApple(dto: OAuthDto): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/apple', dto);
    return res.data.data;
  },

  async refresh(refreshToken: string): Promise<TokenPair> {
    const res = await api.post<{ success: boolean; data: { tokens: TokenPair } }>('/auth/refresh', {
      refreshToken,
    });
    return res.data.data.tokens;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResult> {
    const res = await api.post<{ success: boolean; data: ForgotPasswordResult }>(
      '/auth/forgot-password',
      dto,
    );
    return res.data.data;
  },

  async validateResetCode(dto: { email: string; code: string }): Promise<void> {
    await api.post('/auth/validate-reset-code', dto);
  },

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    await api.post('/auth/reset-password', dto);
  },

  async getMe(): Promise<AuthResponse['user']> {
    const res = await api.get<{ success: boolean; data: { user: AuthResponse['user'] } }>(
      '/auth/me',
    );
    return res.data.data.user;
  },

  async verifyEmail(dto: { email: string; code: string }): Promise<AuthResponse['user']> {
    const res = await api.post<{ success: boolean; data: { user: AuthResponse['user'] } }>(
      '/auth/verify-email',
      dto,
    );
    return res.data.data.user;
  },

  async sendVerificationEmail(dto: { email: string }): Promise<void> {
    await api.post('/auth/send-verification', dto);
  },
};
