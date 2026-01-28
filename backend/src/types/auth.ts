export interface User {
  id: number;
  email: string;
  name: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
