import axios from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;

const API_URL = `${baseUrl}/chat`

export const startConversationApi = async (access_token: string) => {
  const response = await axios.post(
    `${API_URL}/start_conversation`,
    {},
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  return response.data;
};

export const sendChatMessageApi = async (data: { model: string; prompt: string; conversation_number: number; access_token: string }) => {
  const { model, prompt, conversation_number, access_token } = data;
  const response = await axios.post(
    `${API_URL}/`,
    { model, prompt, conversation_number },
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  return response.data;
};

export const fetchChatHistoryApi = async (access_token: string, conversation_number: number) => {
  const response = await axios.get(`${API_URL}/history?conversation_number=${conversation_number}`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  return response.data;
};

export const listConversationsApi = async (access_token: string) => {
  const response = await axios.get(`${API_URL}/conversations`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  return response.data;
};
