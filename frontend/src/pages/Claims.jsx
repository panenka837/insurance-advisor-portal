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
  Chip,
} from '@mui/material';
import axios from 'axios';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

const Claims = () => {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await axios.get('/api/claims');
        setClaims(response.data);
      } catch (error) {
        console.error('Error fetching claims:', error);
      }
    };

    fetchClaims();
  }, []);

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 4, color: 'primary.main' }}>
        Claims Overzicht
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Polis ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Document</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell>{claim.id}</TableCell>
                <TableCell>{claim.policy_id}</TableCell>
                <TableCell>
                  <Chip
                    label={claim.status}
                    color={getStatusColor(claim.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {claim.document_url ? (
                    <a href={claim.document_url} target="_blank" rel="noopener noreferrer">
                      Bekijk Document
                    </a>
                  ) : (
                    'Geen document'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Claims;
