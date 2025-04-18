import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Insurances from './pages/Insurances';
import Claims from './pages/Claims';
import Statistics from './pages/Statistics';
import Contact from './pages/Contact';
import About from './pages/About';
import Agenda from './pages/Agenda';
import Accounting from './pages/Accounting';

import AdminRoute from './components/AdminRoute';

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

const App = () => {
  // AuthProvider moet buiten useAuth staan, dus we maken een subcomponent voor de router
  const AppRoutes = () => {
    const { user, loading } = useAuth();
    if (loading) return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#FF0066', fontWeight: 500, fontSize: 22 }}>Bezig met laden...</span>
      </div>
    );
    if (!user && !loading && window.location.pathname !== '/login') {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ color: '#FF1744', fontWeight: 500, fontSize: 20 }}>Niet ingelogd of sessie verlopen.</span>
          <a href="/login" style={{ color: '#FF0066', marginTop: 16 }}>Klik hier om opnieuw in te loggen</a>
        </div>
      );
    }
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contact" element={<Contact />} />
            <Route path="insurances" element={<Insurances />} />
            <Route path="claims" element={<Claims />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="about" element={<About />} />
            <Route path="accounting" element={user && user.role === 'admin' ? <Accounting /> : <Navigate to="/app/dashboard" replace />} />
            <Route path="agenda" element={<Agenda />} />
            
          </Route>
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
