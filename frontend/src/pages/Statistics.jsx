import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

import { useAuth } from '../contexts/AuthContext';

const Statistics = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/statistics');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Er is een fout opgetreden bij het ophalen van de statistieken.');
        setLoading(false);
      }
    };

    fetchStats();
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

  if (!stats) return null;

  // Admin-knop voor kerncijfers
  const adminStats = [
    { label: 'Aantal gebruikers', value: stats.total_users },
    { label: 'Aantal polissen', value: stats.total_policies },
    { label: 'Aantal claims', value: stats.total_claims },
    { label: 'Totaal premie-inkomsten', value: stats.total_premiums },
    { label: 'Totaal uitbetaalde claims', value: stats.total_claims_paid },
    // Voeg hier meer kerncijfers toe indien beschikbaar
  ];

  const monthlyPremiums = {
    labels: stats.monthly_premiums.labels,
    datasets: [
      {
        label: 'Premie Inkomsten',
        data: stats.monthly_premiums.data,
        borderColor: '#FF0066',
        backgroundColor: 'rgba(255, 0, 102, 0.1)',
        fill: true,
      },
    ],
  };

  const claimsByType = {
    labels: stats.claims_by_type.labels,
    datasets: [
      {
        label: 'Claims per Type',
        data: stats.claims_by_type.data,
        backgroundColor: [
          'rgba(255, 0, 102, 0.7)',
          'rgba(204, 204, 0, 0.7)',
          'rgba(0, 153, 204, 0.7)',
          'rgba(102, 204, 0, 0.7)',
        ],
      },
    ],
  };

  const customerGrowth = {
    labels: stats.customer_growth.labels,
    datasets: [
      {
        label: 'Nieuwe Klanten',
        data: stats.customer_growth.data,
        backgroundColor: 'rgba(255, 0, 102, 0.7)',
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'primary.main' }}>
        Statistieken
      </Typography>
      {user && user.role === 'admin' && (
        <Button variant="contained" color="secondary" sx={{ mb: 3 }} onClick={() => setDialogOpen(true)}>
          Bekijk applicatie-statistieken
        </Button>
      )}

      {/* Fictieve data generator knop in dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Applicatie Statistieken</DialogTitle>
        {user && user.role === 'admin' && (
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 1, mb: 2, float: 'right' }}
            onClick={() => setStats({
              ...stats,
              tab: 0,
              total_users: 4,
              total_policies: 6,
              total_claims: 3,
              total_premiums: '€ 2.500',
              total_claims_paid: '€ 1.200',
              users: [
                { id: 1, name: 'Jan Jansen', email: 'jan@demo.nl', role: 'client', active: true },
                { id: 2, name: 'Sanne Smit', email: 'sanne@demo.nl', role: 'advisor', active: true },
                { id: 3, name: 'Piet Pieters', email: 'piet@demo.nl', role: 'client', active: false },
                { id: 4, name: 'Admin', email: 'admin@demo.nl', role: 'admin', active: true },
              ],
              policies: [
                { id: 1, number: 'P-1001', type: 'Aansprakelijkheid', status: 'Actief', user_name: 'Jan Jansen' },
                { id: 2, number: 'P-1002', type: 'Inboedel', status: 'Actief', user_name: 'Jan Jansen' },
                { id: 3, number: 'P-1003', type: 'Reis', status: 'Beëindigd', user_name: 'Sanne Smit' },
                { id: 4, number: 'P-1004', type: 'Auto', status: 'Actief', user_name: 'Piet Pieters' },
                { id: 5, number: 'P-1005', type: 'Woonhuis', status: 'Actief', user_name: 'Jan Jansen' },
                { id: 6, number: 'P-1006', type: 'Rechtsbijstand', status: 'Beëindigd', user_name: 'Sanne Smit' },
              ],
              claims: [
                { id: 1, policy_number: 'P-1002', amount: 500, status: 'Uitbetaald', date: '2025-03-15' },
                { id: 2, policy_number: 'P-1004', amount: 700, status: 'In behandeling', date: '2025-04-01' },
                { id: 3, policy_number: 'P-1001', amount: 300, status: 'Afgewezen', date: '2025-02-10' },
              ],
              revenue: [
                { month: '2025-01', premiums: 800, claims_paid: 200 },
                { month: '2025-02', premiums: 900, claims_paid: 300 },
                { month: '2025-03', premiums: 800, claims_paid: 700 },
                { month: '2025-04', premiums: 0, claims_paid: 0 },
              ]
            })}
          >Genereer fictieve statistieken</Button>
        )}
        <DialogContent>
          {(!stats.users || stats.users.length === 0)
            && (!stats.policies || stats.policies.length === 0)
            && (!stats.claims || stats.claims.length === 0)
            && (!stats.revenue || stats.revenue.length === 0)
            && (!stats.total_users && !stats.total_policies && !stats.total_claims && !stats.total_premiums && !stats.total_claims_paid)
            ? (
              <Alert severity="info">Er zijn geen applicatie statistieken beschikbaar.</Alert>
            ) : (<>
          <Tabs value={stats.tab || 0} onChange={(e, v) => setStats({ ...stats, tab: v })} sx={{ mb: 2 }}>
            <Tab label="Overzicht" />
            <Tab label="Gebruikers" />
            <Tab label="Polissen" />
            <Tab label="Claims" />
            <Tab label="Omzet" />
          </Tabs>
          {/* Overzicht tab */}
          {(!stats.tab || stats.tab === 0) && (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableBody>
                  <TableRow><TableCell>Aantal gebruikers</TableCell><TableCell>{stats.total_users ?? '-'}</TableCell></TableRow>
                  <TableRow><TableCell>Aantal polissen</TableCell><TableCell>{stats.total_policies ?? '-'}</TableCell></TableRow>
                  <TableRow><TableCell>Aantal claims</TableCell><TableCell>{stats.total_claims ?? '-'}</TableCell></TableRow>
                  <TableRow><TableCell>Totaal premie-inkomsten</TableCell><TableCell>{stats.total_premiums ?? '-'}</TableCell></TableRow>
                  <TableRow><TableCell>Totaal uitbetaalde claims</TableCell><TableCell>{stats.total_claims_paid ?? '-'}</TableCell></TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {/* Gebruikers tab */}
          {stats.tab === 1 && (
            stats.users && stats.users.length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Naam</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name || '-'}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.role}</TableCell>
                        <TableCell>{u.active ? 'Actief' : 'Inactief'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Alert severity="info">Geen gebruikersgegevens beschikbaar.</Alert>
          )}
          {/* Polissen tab */}
          {stats.tab === 2 && (
            stats.policies && stats.policies.length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Polisnummer</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Gebruiker</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.policies.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.number}</TableCell>
                        <TableCell>{p.type}</TableCell>
                        <TableCell>{p.status}</TableCell>
                        <TableCell>{p.user_name || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Alert severity="info">Geen polisgegevens beschikbaar.</Alert>
          )}
          {/* Claims tab */}
          {stats.tab === 3 && (
            stats.claims && stats.claims.length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Claim ID</TableCell>
                      <TableCell>Polis</TableCell>
                      <TableCell>Bedrag</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Datum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.claims.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.id}</TableCell>
                        <TableCell>{c.policy_number}</TableCell>
                        <TableCell>&euro; {c.amount}</TableCell>
                        <TableCell>{c.status}</TableCell>
                        <TableCell>{c.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Alert severity="info">Geen claimgegevens beschikbaar.</Alert>
          )}
          {/* Omzet tab */}
          {stats.tab === 4 && (
            stats.revenue && stats.revenue.length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Maand</TableCell>
                      <TableCell>Premie-inkomsten</TableCell>
                      <TableCell>Uitbetaalde claims</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.revenue.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{r.month}</TableCell>
                        <TableCell>&euro; {r.premiums}</TableCell>
                        <TableCell>&euro; {r.claims_paid}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Alert severity="info">Geen omzetgegevens beschikbaar.</Alert>
          )}
          </>)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Sluiten</Button>
        </DialogActions>
      </Dialog>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Maandelijkse Premie Inkomsten
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={monthlyPremiums}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Claims per Verzekering
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie
                data={claimsByType}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Klantengroei per Kwartaal
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={customerGrowth}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics;
