const isDevelopment = process.env.NODE_ENV === 'development';

export const API_URL = isDevelopment 
  ? 'http://localhost:5002'
  : 'https://insurance-advisor-portal.onrender.com/api';
