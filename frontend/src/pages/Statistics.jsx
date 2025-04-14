import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box } from '@mui/material';
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

const Statistics = () => {
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
    <div>
      <Typography variant="h4" sx={{ mb: 4, color: 'primary.main' }}>
        Statistieken
      </Typography>
      
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
    </div>
  );
};

export default Statistics;
