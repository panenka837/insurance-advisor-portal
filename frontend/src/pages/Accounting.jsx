import React from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Demo data (vervang later door API-data)
const payments = [
  { id: 1, klant: 'Jordi Klaris', bedrag: 120.50, datum: '2025-04-01', status: 'Betaald' },
  { id: 2, klant: 'Sanne de Vries', bedrag: 85.00, datum: '2025-04-03', status: 'Open' },
  { id: 3, klant: 'Risk Pro Actief', bedrag: 240.00, datum: '2025-04-10', status: 'Betaald' },
  { id: 4, klant: 'Jan Jansen', bedrag: 99.99, datum: '2025-04-14', status: 'Open' },
];

const statusColor = (status) => {
  switch (status) {
    case 'Betaald':
      return 'success';
    case 'Open':
      return 'warning';
    default:
      return 'default';
  }
};

const totalBedrag = payments.reduce((sum, p) => sum + p.bedrag, 0);
const countBetaald = payments.filter(p => p.status === 'Betaald').length;
const countOpen = payments.filter(p => p.status === 'Open').length;
const totalCount = payments.length;

const Accounting = () => (
  <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
    <Paper sx={{ p: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AccountBalanceIcon sx={{ color: '#CCCC00', fontSize: 36, mr: 2 }} />
        <Typography variant="h4" color="primary">Boekhouding</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Overzicht van betalingen en openstaande posten. Alleen zichtbaar voor admins.
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Klant</TableCell>
            <TableCell>Bedrag (€)</TableCell>
            <TableCell>Datum</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.klant}</TableCell>
              <TableCell>{row.bedrag.toFixed(2)}</TableCell>
              <TableCell>{row.datum}</TableCell>
              <TableCell><Chip label={row.status} color={statusColor(row.status)} size="small" /></TableCell>
            </TableRow>
          ))}
          {/* Cumulatieve rij */}
          <TableRow sx={{ backgroundColor: '#f3f3f3', fontWeight: 600 }}>
            <TableCell colSpan={2}><strong>Totaal / Cumulatief</strong></TableCell>
            <TableCell><strong>{totalBedrag.toFixed(2)}</strong></TableCell>
            <TableCell><strong>{totalCount} betalingen</strong></TableCell>
            <TableCell>
              <Chip label={`Betaald: ${countBetaald}`} color="success" size="small" sx={{ mr: 1 }} />
              <Chip label={`Open: ${countOpen}`} color="warning" size="small" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  </Box>
);

export default Accounting;
