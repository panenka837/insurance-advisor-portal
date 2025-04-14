import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Insurances from './pages/Insurances';
import Claims from './pages/Claims';
import Statistics from './pages/Statistics';
import Contact from './pages/Contact';
import Login from './pages/Login';

// Auth Context
import { AuthProvider } from './contexts/AuthContext';

// Config
import { API_URL } from './config';
import axios from 'axios';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF0066', // Risk Pro Actief Pink
      light: '#ff4d94',
      dark: '#cc0052',
    },
    secondary: {
      main: '#CCCC00',
      light: '#ffff33',
      dark: '#999900',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
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
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
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
            <Route
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/insurances" element={<Insurances />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/statistics" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <Statistics />
                </RoleBasedRoute>
              } />
              <Route path="/contact" element={<Contact />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
