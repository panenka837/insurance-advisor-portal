import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Home as HomeIcon,
  Security as SecurityIcon,
  Euro as EuroIcon,
  Event as EventIcon,
  Warning as RiskIcon
} from '@mui/icons-material';
import axios from 'axios';

const getInsuranceIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'autoverzekering':
      return <CarIcon fontSize="large" />;
    case 'woonverzekering':
      return <HomeIcon fontSize="large" />;
    case 'aansprakelijkheidsverzekering':
      return <SecurityIcon fontSize="large" />;
    default:
      return <SecurityIcon fontSize="large" />;
  }
};

import { useAuth } from '../contexts/AuthContext';

const InsuranceCard = ({ insurance, onClick, onEdit, isAdmin }) => (
  <Card
    onClick={onClick}
    sx={{
      height: '100%',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.02)',
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          backgroundColor: 'primary.main',
          borderRadius: '50%',
          p: 1,
          mr: 2,
          color: 'white'
        }}>
          {getInsuranceIcon(insurance.type)}
        </Box>
        <Box>
          <Typography variant="h6" component="div">
            {insurance.type}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {insurance.dekking}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="primary">
          €{insurance.premie.toFixed(2)}/mnd
        </Typography>
        <Chip
          label={insurance.status}
          color={insurance.status === 'actief' ? 'success' : 'warning'}
          size="small"
        />
      </Box>
      {isAdmin && (
        <Button variant="outlined" color="secondary" sx={{ mt: 2 }} onClick={e => { e.stopPropagation(); onEdit(insurance); }}>
          Bewerk
        </Button>
      )}
    </CardContent>
  </Card>
);


const InsuranceDetails = ({ insurance, open, onClose }) => {
  if (!insurance) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          backgroundColor: 'primary.main',
          borderRadius: '50%',
          p: 1,
          color: 'white'
        }}>
          {getInsuranceIcon(insurance.type)}
        </Box>
        {insurance.type}
      </DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemText
              primary="Dekking"
              secondary={insurance.dekking}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EuroIcon color="primary" />
                Maandelijkse premie
              </Box>}
              secondary={`€${insurance.premie.toFixed(2)}`}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RiskIcon color="primary" />
                Eigen risico
              </Box>}
              secondary={`€${insurance.eigen_risico.toFixed(2)}`}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon color="primary" />
                Vervaldatum
              </Box>}
              secondary={new Date(insurance.vervaldatum).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Beschrijving"
              secondary={insurance.beschrijving}
              secondaryTypographyProps={{ style: { whiteSpace: 'pre-wrap' } }}
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Sluiten</Button>
      </DialogActions>
    </Dialog>
  );
};

const Insurances = () => {
  const [insurances, setInsurances] = useState([]);
  const [editInsurance, setEditInsurance] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const { user } = useAuth();
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsurances = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[DEBUG] Token gebruikt voor ophalen verzekeringen:', token);
        const response = await axios.get('/api/policies', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        console.log('[DEBUG] Response van backend:', response);
        setInsurances(response.data);
      } catch (err) {
        setError('Er is een fout opgetreden bij het ophalen van uw verzekeringen');
        console.error('Error fetching insurances:', err);
        // Automatisch uitloggen bij 401/403 of als user niet bestaat
        if (err.response && (err.response.status === 401 || err.response.status === 403 || err.response.status === 404)) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInsurances();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Laden...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mijn Verzekeringen
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Overzicht van al uw lopende verzekeringen
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {insurances.map((insurance) => (
          <Grid item xs={12} sm={6} md={4} key={insurance.id}>
            <InsuranceCard
              insurance={insurance}
              onClick={() => setSelectedInsurance(insurance)}
              onEdit={setEditInsurance}
              isAdmin={user && user.role === 'admin'}
            />
          </Grid>
        ))}
      </Grid>

      <InsuranceDetails
        insurance={selectedInsurance}
        open={Boolean(selectedInsurance)}
        onClose={() => setSelectedInsurance(null)}
      />

      {/* Admin edit dialog */}
      {editInsurance && (
        <Dialog open={Boolean(editInsurance)} onClose={() => setEditInsurance(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Verzekering bewerken</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Type" value={editInsurance.type} onChange={e => setEditInsurance({ ...editInsurance, type: e.target.value })} fullWidth />
              <TextField label="Dekking" value={editInsurance.dekking} onChange={e => setEditInsurance({ ...editInsurance, dekking: e.target.value })} fullWidth />
              <TextField label="Premie (€)" type="number" value={editInsurance.premie} onChange={e => setEditInsurance({ ...editInsurance, premie: Number(e.target.value) })} fullWidth />
              <TextField label="Status" value={editInsurance.status} onChange={e => setEditInsurance({ ...editInsurance, status: e.target.value })} fullWidth />
              <TextField label="Beschrijving" value={editInsurance.beschrijving} onChange={e => setEditInsurance({ ...editInsurance, beschrijving: e.target.value })} multiline rows={2} fullWidth />
              <TextField label="Eigen risico (€)" type="number" value={editInsurance.eigen_risico} onChange={e => setEditInsurance({ ...editInsurance, eigen_risico: Number(e.target.value) })} fullWidth />
              <TextField label="Vervaldatum" type="date" value={editInsurance.vervaldatum?.slice(0,10) || ''} onChange={e => setEditInsurance({ ...editInsurance, vervaldatum: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
              {editError && <Typography color="error">{editError}</Typography>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditInsurance(null)}>Annuleren</Button>
            <Button variant="contained" color="primary" disabled={editLoading} onClick={async () => {
              setEditLoading(true);
              setEditError('');
              try {
                const token = localStorage.getItem('token');
                await axios.patch(`/api/policies/${editInsurance.id}`, editInsurance, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                // Refresh lijst
                const response = await axios.get('/api/policies', {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setInsurances(response.data);
                setEditInsurance(null);
              } catch (err) {
                setEditError('Opslaan mislukt. Controleer de gegevens.');
              } finally {
                setEditLoading(false);
              }
            }}>
              Opslaan
            </Button>
          </DialogActions>
        </Dialog>
      )}

    </Box>
  );
};

export default Insurances;
