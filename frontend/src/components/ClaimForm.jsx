import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';

const initialState = {
  policy_id: '',
  description: '',
  claim_date: '',
  amount: '',
  document: null,
};

const ClaimForm = ({ open, onClose, onSuccess, policies = [] }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      await axios.post('/api/claims', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(initialState);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError('Fout bij indienen van claim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Claim indienen</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="policy-label">Polis</InputLabel>
            <Select
              labelId="policy-label"
              name="policy_id"
              value={form.policy_id}
              label="Polis"
              onChange={handleChange}
              required
            >
              {policies.map((policy) => (
                <MenuItem key={policy.id} value={policy.id}>
                  {policy.name || `Polis #${policy.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="description"
            label="Omschrijving"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            name="claim_date"
            label="Datum"
            type="date"
            value={form.claim_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            name="amount"
            label="Bedrag (€)"
            type="number"
            value={form.amount}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <Button
            variant="outlined"
            component="label"
            sx={{ mb: 2 }}
          >
            Bijlage toevoegen
            <input
              type="file"
              name="document"
              hidden
              onChange={handleChange}
              accept="application/pdf,image/*"
            />
          </Button>
          {form.document && <Box sx={{ mb: 2 }}>{form.document.name}</Box>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Annuleren</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          Indienen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClaimForm;
