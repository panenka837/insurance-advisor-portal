import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { Shield, QuestionMark, Person, Security, Computer } from '@mui/icons-material';

const FeatureCard = ({ icon, title, description, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
    '&:hover': {
      boxShadow: 6,
      transform: 'translateY(-4px)',
      transition: 'all 0.3s ease-in-out',
      cursor: 'pointer'
    }
  }}>
    <CardContent sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      p: 3
    }}>
      <Box sx={{
        backgroundColor: 'primary.main',
        borderRadius: '50%',
        p: 2,
        mb: 2,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </Box>
      <Typography variant="h6" component="h2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const StatCard = ({ icon, value, label }) => (
  <Paper sx={{
    p: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    borderRadius: 2
  }}>
    <Box sx={{
      backgroundColor: 'primary.main',
      borderRadius: '50%',
      p: 1,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  </Paper>
);

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <Typography>Bezig met laden...</Typography>;
  }
  // Altijd volledig dashboard tonen, ongeacht loginstatus
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welkom bij Uw Verzekeringsportaal
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Beheer uw polissen en betalingen op één plek
      </Typography>
       <Grid container spacing={4} sx={{ mb: 4, mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <FeatureCard
            icon={<Shield sx={{ fontSize: 40 }} />}
            title="Mijn Verzekeringen"
            description="Bekijk en beheer uw verzekeringen en dekkingsdetails"
            onClick={() => navigate('/insurances')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FeatureCard
            icon={<QuestionMark sx={{ fontSize: 40 }} />}
            title="Contact"
            description="Heeft u vragen? Neem contact op met ons supportteam"
            onClick={() => navigate('/contact')}
          />
        </Grid>
      </Grid>
      {/* Admin-sectie alleen voor admins */}
      {user && user.role === 'admin' && (
        <>
          <Typography variant="h5" sx={{ mb: 3, mt: 4 }}>
            Risk Pro Actief
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Administrator Dashboard
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<Person />}
                value="124"
                label="Totaal klanten"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<Security />}
                value="89"
                label="Actieve polissen"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<Computer />}
                value="Online"
                label="Systeem status"
              />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
