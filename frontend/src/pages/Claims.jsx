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
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import ClaimForm from '../components/ClaimForm';

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

import { useAuth } from '../contexts/AuthContext';

const Claims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  // Admin functionaliteit
  const [users, setUsers] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userClaims, setUserClaims] = useState([]);

  const openDetails = (claim) => {
    setSelectedClaim(claim);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedClaim(null);
  };

  const fetchClaims = async () => {
    try {
      const response = await axios.get('/api/claims');
      setClaims(response.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('/api/policies');
      setPolicies(response.data);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchPolicies();
    if (user && user.role === 'admin') {
      axios.get('/api/users').then(res => setUsers(res.data)).catch(() => {});
    }
  }, [user]);

  // Admin: claims ophalen voor geselecteerde gebruiker
  const handleUserClick = async (userObj) => {
    setSelectedUser(userObj);
    setUserDialogOpen(true);
    try {
      const res = await axios.get(`/api/claims?user_id=${userObj.id}`);
      setUserClaims(res.data);
    } catch (err) {
      setUserClaims([]);
    }
  };

  const closeUserDialog = () => {
    setUserDialogOpen(false);
    setSelectedUser(null);
    setUserClaims([]);
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 4, color: 'primary.main' }}>
        Claims Overzicht
      </Typography>
      {/* Admin en Adviseur: overzicht alle claims */}
      {user && (user.role === 'admin' || user.role === 'adviseur') && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Alle Claims</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Gebruiker</TableCell>
                  <TableCell>Polis ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Document</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map(claim => {
                  const claimUser = users.find(u => u.id === claim.user_id) || {};
                  return (
                    <TableRow key={claim.id}>
                      <TableCell>{claim.id}</TableCell>
                      <TableCell>{claimUser.name || '-'} ({claimUser.email || '-'})</TableCell>
                      <TableCell>{claim.policy_id}</TableCell>
                      <TableCell>
                        <Chip label={claim.status} color={getStatusColor(claim.status)} size="small" />
                      </TableCell>
                      <TableCell>
                        {claim.document_url ? (
                          <a href={claim.document_url} target="_blank" rel="noopener noreferrer">
                            Bekijk Document
                          </a>
                        ) : 'Geen document'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Admin only: gebruikerslijst */}
      {user && user.role === 'admin' && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Gebruikers</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {users.map(u => (
              <Button key={u.id} variant="outlined" color="primary" onClick={() => handleUserClick(u)} sx={{ mb: 1 }}>
                {u.name} ({u.email})
              </Button>
            ))}
          </Stack>
        </Paper>
      )}
      {/* Dialoog met claims per gebruiker */}
      <Dialog open={userDialogOpen} onClose={closeUserDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Claims van {selectedUser?.name || ''} ({selectedUser?.email || ''})
          <IconButton aria-label="close" onClick={closeUserDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {userClaims.length === 0 ? (
            <Typography variant="body2">Geen claims gevonden.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Polis ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Document</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userClaims.map(claim => (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.id}</TableCell>
                    <TableCell>{claim.policy_id}</TableCell>
                    <TableCell>
                      <Chip label={claim.status} color={getStatusColor(claim.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      {claim.document_url ? (
                        <a href={claim.document_url} target="_blank" rel="noopener noreferrer">
                          Bekijk Document
                        </a>
                      ) : 'Geen document'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUserDialog}>Sluiten</Button>
        </DialogActions>
      </Dialog>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained" color="primary" onClick={() => setFormOpen(true)}>
          Claim indienen
        </Button>
      </Stack>
      <ClaimForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchClaims}
        policies={policies}
      />
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
              <TableRow key={claim.id} hover style={{ cursor: 'pointer' }} onClick={() => openDetails(claim)}>
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
                    <a href={claim.document_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
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
      {/* Claim Details Dialog */}
      <Dialog open={detailsOpen} onClose={closeDetails} maxWidth="sm" fullWidth>
        <DialogTitle>
          Claim Details
          <IconButton
            aria-label="close"
            onClick={closeDetails}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedClaim && (
            <>
              <Typography variant="subtitle2" color="textSecondary">
                Claim ID: {selectedClaim.id}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <b>Status:</b> <Chip label={selectedClaim.status} color={getStatusColor(selectedClaim.status)} size="small" />
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <b>Polis ID:</b> {selectedClaim.policy_id}
              </Typography>
              {selectedClaim.document_url && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <b>Document:</b> <a href={selectedClaim.document_url} target="_blank" rel="noopener noreferrer">Bekijk Document</a>
                </Typography>
              )}
              {selectedClaim.beschrijving && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <b>Beschrijving:</b> {selectedClaim.beschrijving}
                </Typography>
              )}
              {/* Voeg hier andere relevante claimvelden toe indien aanwezig */}
            </>
          )}
        </DialogContent>
      <DialogActions>
        <Button onClick={closeDetails} color="primary">Sluiten</Button>
      </DialogActions>
    </Dialog>
  </div>
  );
};

export default Claims;
