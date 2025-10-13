export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  provider?: 'EMAIL' | 'GOOGLE' | 'GITHUB' | 'MICROSOFT';
  emailVerified?: Date | null;
  isActive?: boolean;
  lastLoginAt?: Date | null;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'github' | 'microsoft') => Promise<void>;
  logout: () => Promise<void>;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthError {
  message: string;
  field?: string;
}
