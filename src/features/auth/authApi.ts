import axios from 'axios';
const baseUrl = import.meta.env.VITE_BASE_URL;

const API_URL = `${baseUrl}/auth`

export const loginApi = async (data: { username: string; password: string }) => {
  const response = await axios.post(`${API_URL}/login`, data);
  return response.data;
};

export const signupApi = async (data: { username: string; email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/signup`, data);
  return response.data;
};

export const refreshTokenApi = async (refresh_token: string) => {
  const response = await axios.post(`${API_URL}/refresh`, {}, {
    headers: { Authorization: `Bearer ${refresh_token}` },
  });
  return response.data;
};
