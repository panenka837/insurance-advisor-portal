import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Insurances from './pages/Insurances';
import Claims from './pages/Claims';
import Statistics from './pages/Statistics';
import Contact from './pages/Contact';

// Auth Context
import { AuthProvider } from './contexts/AuthContext';

// Config
import { API_URL } from './config';
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = API_URL;

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF0066',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#FF1744',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    text: {
      primary: '#333333',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

// Configure axios
axios.defaults.baseURL = API_URL;

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="insurances" element={<Insurances />} />
              <Route path="claims" element={<Claims />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
