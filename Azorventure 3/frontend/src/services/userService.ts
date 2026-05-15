import api from './api';

export interface Interesses {
  topicos: string[];
  subtopicos: string[];
}

export const salvarInteresses = async (interesses: Interesses) => {
  const response = await api.post('/user/interesses', interesses);
  return response.data;
};

export const guardarPushToken = async (pushToken: string) => {
  const response = await api.post('/user/push-token', { pushToken });
  return response.data;
};

export const removerPushToken = async () => {
  const response = await api.delete('/user/push-token');
  return response.data;
};
