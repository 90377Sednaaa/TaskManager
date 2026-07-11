import api from './client';
import type { AuthResponse } from '../types';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/login', { email, password });
  return res.data;
}

export const register = async (name: string, email: string, password: string, password_confirmation: string): Promise<AuthResponse> => {
  const res = await api.post('/register', { name, email, password, password_confirmation });
  return res.data;
}