import React from 'react';
import { Box, Typography, Paper, Avatar, Grid } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const team = [
  {
    name: 'Jordi Klaris',
    role: 'Oprichter & Adviseur',
    description: 'Met meer dan 15 jaar ervaring in de verzekeringsbranche helpt Jordi klanten met persoonlijk en onafhankelijk advies.'
  },
  {
    name: 'Sanne de Vries',
    role: 'Klantenservice',
    description: 'Sanne zorgt voor een vriendelijke en snelle afhandeling van alle klantvragen.'
  },
  {
    name: 'Risk Pro Actief',
    role: 'Ons Merk',
    description: 'Wij staan voor transparantie, betrouwbaarheid en een persoonlijke aanpak.'
  }
];

const About = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
    <Paper sx={{ p: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: '#FF0066', mr: 2 }}>
          <InfoIcon />
        </Avatar>
        <Typography variant="h4" color="primary">Over Ons</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Risk Pro Actief is een onafhankelijk verzekeringskantoor gespecialiseerd in maatwerkoplossingen voor particulieren en ondernemers. Wij geloven in persoonlijk contact, transparant advies en het bouwen van langdurige relaties met onze klanten.
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Ons team bestaat uit ervaren adviseurs en enthousiaste medewerkers die klaarstaan om je te helpen bij al je verzekeringsvragen. Betrouwbaarheid, service en innovatie staan bij ons centraal.
      </Typography>
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Ons Team</Typography>
      <Grid container spacing={3}>
        {team.map(lid => (
          <Grid item xs={12} sm={6} md={4} key={lid.name}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafd' }}>
              <Avatar sx={{ bgcolor: '#CCCC00', mx: 'auto', mb: 1 }}>{lid.name[0]}</Avatar>
              <Typography variant="subtitle1" fontWeight={600}>{lid.name}</Typography>
              <Typography variant="body2" color="textSecondary">{lid.role}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{lid.description}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  </Box>
);

export default About;
