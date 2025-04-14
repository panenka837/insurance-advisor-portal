import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from '@mui/material';

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        U heeft geen toegang tot deze pagina.
      </Alert>
    );
  }

  return children;
};

export default RoleBasedRoute;
