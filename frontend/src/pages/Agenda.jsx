import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

function Agenda() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState(null);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/appointments');
      setAppointments(res.data);
    } catch (e) {
      setAppointments([]);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, []);

  const handleAdd = async () => {
    if (!title || !start) {
      setError('Vul alle verplichte velden in.');
      return;
    }
    try {
      const startDate = new Date(start);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 uur
      await axios.post('/api/appointments', {
        title,
        description,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });
      setOpen(false);
      setTitle('');
      setDescription('');
      setStart(null);
      setError('');
      fetchAppointments();
    } catch (e) {
      setError('Kon afspraak niet opslaan.');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, color: 'primary.main' }}>
          Agenda
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            Afspraak inplannen
          </Button>
        </Stack>
        {error && (
          <Typography sx={{ mb: 2 }} color="error">
            {error}
          </Typography>
        )}
        <Typography variant="h6" sx={{ mb: 2 }}>Afspraken</Typography>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 8 }}>Titel</th>
                <th style={{ padding: 8 }}>Omschrijving</th>
                <th style={{ padding: 8 }}>Start</th>
                <th style={{ padding: 8 }}>Einde</th>
                {user && user.role === 'admin' && <th style={{ padding: 8 }}>Gebruiker</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id}>
                  <td style={{ padding: 8 }}>{appt.title}</td>
                  <td style={{ padding: 8 }}>{appt.description}</td>
                  <td style={{ padding: 8 }}>{format(new Date(appt.start), 'dd-MM-yyyy HH:mm')}</td>
                  <td style={{ padding: 8 }}>{format(new Date(appt.end), 'dd-MM-yyyy HH:mm')}</td>
                  {user && user.role === 'admin' && (
                    <td style={{ padding: 8 }}>{appt.user_name || 'Onbekend'}</td>
                  )}
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={user && user.role === 'admin' ? 5 : 4} style={{ textAlign: 'center', color: '#999' }}>
                    Geen afspraken gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Nieuwe afspraak inplannen</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Titel" value={title} onChange={e => setTitle(e.target.value)} required />
            <TextField label="Omschrijving" value={description} onChange={e => setDescription(e.target.value)} multiline rows={2} />
            <DateTimePicker
              label="Starttijd"
              value={start}
              onChange={setStart}
              renderInput={params => <TextField {...params} required />}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: -1 }}>
              Duur: 1 uur (eindtijd wordt automatisch ingesteld)
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuleren</Button>
          <Button variant="contained" onClick={handleAdd}>Opslaan</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default Agenda;
