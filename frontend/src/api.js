import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export const simulateModulation = async (config) => {
  const response = await api.post('/simulate', config);
  return response.data;
};
