import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Snackbar,
  Alert,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Contact = () => {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      setLoadingMessages(true);
      axios.get('/api/contact')
        .then(res => {
          setMessages(res.data);
          setErrorMessages(null);
        })
        .catch(err => {
          setErrorMessages('Fout bij ophalen berichten');
        })
        .finally(() => setLoadingMessages(false));
    }
  }, [user]);
  const [formData, setFormData] = useState({
    naam: '',
    email: '',
    telefoon: '',
    onderwerp: '',
    bericht: '',
    voorkeurContact: 'email',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/contact', formData);
      setSnackbar({
        open: true,
        message: 'Uw bericht is succesvol verzonden. Wij nemen zo spoedig mogelijk contact met u op.',
        severity: 'success',
      });
      setFormData({
        naam: '',
        email: '',
        telefoon: '',
        onderwerp: '',
        bericht: '',
        voorkeurContact: 'email',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Er is een fout opgetreden. Probeer het later opnieuw.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Alleen zichtbaar voor admin */}
      {user && user.role === 'admin' && (
        <Paper sx={{ p: 4, mb: 4, background: '#f5f5fa' }}>
          <Typography variant="h5" gutterBottom color="primary">
            Ingezonden Contactberichten
          </Typography>
          {loadingMessages ? (
            <Typography variant="body2">Laden...</Typography>
          ) : errorMessages ? (
            <Alert severity="error">{errorMessages}</Alert>
          ) : messages.length === 0 ? (
            <Typography variant="body2">Geen berichten gevonden.</Typography>
          ) : (
            <Box>
              {messages.map(msg => (
                <Paper key={msg.id} sx={{ mb: 2, p: 2, borderLeft: '4px solid #FF0066' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {new Date(msg.created_at).toLocaleString()} — <b>{msg.naam}</b> ({msg.email})
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><b>Onderwerp:</b> {msg.onderwerp}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><b>Voorkeur contact:</b> {msg.voorkeur_contact}</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>{msg.bericht}</Typography>
                  {msg.telefoon && (
                    <Typography variant="body2" sx={{ mt: 1 }}><b>Telefoon:</b> {msg.telefoon}</Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      )}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Contact Formulier
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Heeft u vragen of opmerkingen? Vul het onderstaande formulier in en wij nemen zo spoedig mogelijk contact met u op.
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Naam"
                name="naam"
                value={formData.naam}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefoonnummer"
                name="telefoon"
                value={formData.telefoon}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Voorkeur contactmethode"
                name="voorkeurContact"
                value={formData.voorkeurContact}
                onChange={handleChange}
              >
                <MenuItem value="email">E-mail</MenuItem>
                <MenuItem value="telefoon">Telefoon</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Onderwerp"
                name="onderwerp"
                value={formData.onderwerp}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Uw bericht"
                name="bericht"
                value={formData.bericht}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
              >
                Verstuur Bericht
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;
