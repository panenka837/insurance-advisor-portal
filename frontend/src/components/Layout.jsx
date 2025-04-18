import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, AppBar, CssBaseline, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Toolbar, Typography, Button } from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon, Description as InsuranceIcon, Assignment as ClaimIcon, BarChart as StatsIcon, ContactSupport as ContactIcon, Info as InfoIcon, Logout as LogoutIcon, AccountBalance as AccountBalanceIcon, EventNote as AgendaIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const getMenuItems = (role) => [
  { text: 'Dashboard', path: '/app/dashboard', icon: <DashboardIcon /> },
  { text: 'Verzekeringen', path: '/app/insurances', icon: <InsuranceIcon /> },
  { text: 'Claims', path: '/app/claims', icon: <ClaimIcon /> },
  ...(role === 'admin'
    ? [
        { text: 'Statistieken', path: '/app/statistics', icon: <StatsIcon /> },
        { text: 'Boekhouding', path: '/app/accounting', icon: <AccountBalanceIcon /> },
      ]
    : []),
  { text: 'Agenda', path: '/app/agenda', icon: <AgendaIcon /> },
  { text: 'Contact', path: '/app/contact', icon: <ContactIcon /> },
  { text: 'Over Ons', path: '/app/about', icon: <InfoIcon /> },
];

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" component="div">
          Risk Pro Actief
        </Typography>
      </Toolbar>
      <List>
        {getMenuItems(user?.role).map((item) => (
          <ListItem
            key={item.text}
            disablePadding
            selected={location.pathname === item.path}
          >
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Risk Pro Actief
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.email}
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Uitloggen
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
