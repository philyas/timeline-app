export interface User {
  id: number;
  email: string;
  name: string | null;
  emailVerifiedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
}
