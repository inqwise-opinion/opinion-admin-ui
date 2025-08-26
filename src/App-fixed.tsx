import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import MainLayout from './layouts/MainLayout';
import SimpleDashboard from './pages/dashboard/SimpleDashboard';
import { ROUTES, COLORS } from './constants';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.PRIMARY,
    },
    secondary: {
      main: COLORS.SECONDARY,
    },
    success: {
      main: COLORS.SUCCESS,
    },
    warning: {
      main: COLORS.WARNING,
    },
    error: {
      main: COLORS.ERROR,
    },
    info: {
      main: COLORS.INFO,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

// Placeholder components for routes
const Users = () => (
  <div>
    <h1>Users</h1>
    <p>Users page will be implemented next...</p>
  </div>
);

const Accounts = () => (
  <div>
    <h1>Accounts</h1>
    <p>Accounts page will be implemented next...</p>
  </div>
);

const Surveys = () => (
  <div>
    <h1>Surveys</h1>
    <p>Surveys page will be implemented next...</p>
  </div>
);

const Polls = () => (
  <div>
    <h1>Polls</h1>
    <p>Polls page will be implemented next...</p>
  </div>
);

const Collectors = () => (
  <div>
    <h1>Collectors</h1>
    <p>Collectors page will be implemented next...</p>
  </div>
);

const Payments = () => (
  <div>
    <h1>Payments</h1>
    <p>Payments page will be implemented next...</p>
  </div>
);

const Reports = () => (
  <div>
    <h1>Reports</h1>
    <p>Reports page will be implemented next...</p>
  </div>
);

const SystemEvents = () => (
  <div>
    <h1>System Events</h1>
    <p>System Events page will be implemented next...</p>
  </div>
);

const Settings = () => (
  <div>
    <h1>Settings</h1>
    <p>Settings page will be implemented next...</p>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          
          {/* Main application routes */}
          <Route path="/" element={<MainLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<SimpleDashboard />} />
            <Route path={ROUTES.USERS} element={<Users />} />
            <Route path={ROUTES.ACCOUNTS} element={<Accounts />} />
            <Route path={ROUTES.SURVEYS} element={<Surveys />} />
            <Route path={ROUTES.POLLS} element={<Polls />} />
            <Route path={ROUTES.COLLECTORS} element={<Collectors />} />
            <Route path={ROUTES.PAYMENTS} element={<Payments />} />
            <Route path={ROUTES.REPORTS} element={<Reports />} />
            <Route path={ROUTES.SYSTEM_EVENTS} element={<SystemEvents />} />
            <Route path={ROUTES.SETTINGS} element={<Settings />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
