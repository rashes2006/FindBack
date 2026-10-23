const API_BASE = '/api';

export const apiClient = async (endpoint, { body, ...customConfig } = {}) => {
  const token = localStorage.getItem('findback_token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong with the request');
    }

    return data;
  } catch (error) {
    console.error('API Client Error:', error.message);
    throw error;
  }
};
