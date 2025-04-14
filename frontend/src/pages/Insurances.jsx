import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from '@mui/material';
import axios from 'axios';

const Policies = () => {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await axios.get('/api/policies');
        setPolicies(response.data);
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    };

    fetchPolicies();
  }, []);

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 4, color: 'primary.main' }}>
        Verzekeringen Overzicht
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Dekking</TableCell>
              <TableCell>Premie</TableCell>
              <TableCell>Vervaldatum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.id}</TableCell>
                <TableCell>{policy.dekking}</TableCell>
                <TableCell>€{policy.premie}</TableCell>
                <TableCell>
                  {new Date(policy.vervaldatum).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Policies;
