import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // State voor wachtwoord vergeten dialog
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleForgotOpen = () => {
    setForgotOpen(true);
    setForgotEmail('');
    setForgotSent(false);
    setForgotError('');
  };

  const handleForgotClose = () => {
    setForgotOpen(false);
  };

  const handleForgotSend = (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail)) {
      setForgotError('Vul een geldig e-mailadres in.');
      return;
    }
    // Hier kan later een API-aanroep komen
    setForgotSent(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Ongeldige inloggegevens');
      }
    } catch (err) {
      setError('Er is een fout opgetreden bij het inloggen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fb', // Lichtere achtergrond
        p: { xs: 1, sm: 2 },
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Inloggen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Risk Pro Actief
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="E-mailadres"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Wachtwoord"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !formData.email || !formData.password}
              sx={{ mt: 3 }}
            >
              {loading ? 'Inloggen...' : 'Inloggen'}
            </Button>

            <Button
              variant="text"
              color="primary"
              fullWidth
              sx={{ mt: 1, textTransform: 'none' }}
              onClick={handleForgotOpen}
            >
              Wachtwoord vergeten?
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ mt: 2, textTransform: 'none' }}
              onClick={() => navigate('/dashboard')}
            >
              Ga naar Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Wachtwoord vergeten dialog */}
      <Dialog open={forgotOpen} onClose={handleForgotClose} maxWidth="xs" fullWidth>
        <DialogTitle>Wachtwoord vergeten?</DialogTitle>
        <DialogContent>
          {forgotSent ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Indien het e-mailadres bekend is, ontvang je een resetlink.
            </Alert>
          ) : (
            <form onSubmit={handleForgotSend}>
              <TextField
                autoFocus
                fullWidth
                label="E-mailadres"
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                margin="normal"
                required
              />
              {forgotError && (
                <Alert severity="error" sx={{ mb: 2 }}>{forgotError}</Alert>
              )}
              <DialogActions sx={{ px: 0 }}>
                <Button onClick={handleForgotClose}>Annuleren</Button>
                <Button type="submit" variant="contained" color="primary">Verstuur resetlink</Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Login;
