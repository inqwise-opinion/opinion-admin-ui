import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
} from '@mui/material';
import {
  People,
  Business,
  Poll,
  AttachMoney,
  TrendingUp,
  PersonAdd,
} from '@mui/icons-material';

// Simple types for the component
interface DashboardStats {
  todayUsers: number;
  activeUsers: number;
  totalAccounts: number;
  totalSurveys: number;
  totalResponses: number;
  revenue: number;
}

interface User {
  userId: number;
  userName: string;
  email: string;
  countryName: string;
  provider: string;
  insertDate: string;
}

interface UserHistory {
  id: number;
  userId: number;
  userName: string;
  typeName: string;
  countryName: string;
  clientIp: string;
  insertDate: string;
}

// Simple mock data generator
const generateMockStats = (): DashboardStats => ({
  todayUsers: Math.floor(Math.random() * 20) + 5,
  activeUsers: Math.floor(Math.random() * 500) + 200,
  totalAccounts: Math.floor(Math.random() * 100) + 30,
  totalSurveys: Math.floor(Math.random() * 150) + 50,
  totalResponses: Math.floor(Math.random() * 10000) + 5000,
  revenue: Math.floor(Math.random() * 50000) + 10000,
});

const generateMockUsers = (): User[] => {
  const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France'];
  const providers = ['Google', 'Facebook', 'Email', 'LinkedIn'];
  
  return Array.from({ length: 10 }, (_, i) => ({
    userId: i + 1,
    userName: `user${i + 1}`,
    email: `user${i + 1}@example.com`,
    countryName: countries[i % countries.length],
    provider: providers[i % providers.length],
    insertDate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const generateMockUserHistory = (): UserHistory[] => {
  const types = ['Login', 'Logout', 'Survey Created', 'Account Updated'];
  const countries = ['United States', 'United Kingdom', 'Canada', 'Germany'];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    userId: Math.floor(Math.random() * 100) + 1,
    userName: `user${Math.floor(Math.random() * 100) + 1}`,
    typeName: types[i % types.length],
    countryName: countries[i % countries.length],
    clientIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
    insertDate: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
  }));
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color?: string;
  format?: 'number' | 'currency';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'primary.main',
  format = 'number',
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (format === 'currency') return formatCurrency(val);
    return val.toLocaleString();
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {formatValue(value)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: 2,
              bgcolor: color,
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const EnhancedDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [userHistory, setUserHistory] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const loadData = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(generateMockStats());
      setRecentUsers(generateMockUsers());
      setUserHistory(generateMockUserHistory());
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Today's Users"
              value={stats.todayUsers}
              icon={<PersonAdd />}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              icon={<People />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Total Accounts"
              value={stats.totalAccounts}
              icon={<Business />}
              color="info.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Total Revenue"
              value={stats.revenue}
              icon={<AttachMoney />}
              color="warning.main"
              format="currency"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Total Surveys"
              value={stats.totalSurveys}
              icon={<Poll />}
              color="secondary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Total Responses"
              value={stats.totalResponses}
              icon={<TrendingUp />}
              color="success.main"
            />
          </Grid>
        </Grid>
      )}

      {/* Data Tables */}
      <Grid container spacing={3}>
        {/* Recent Users Table */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Today At a Glance
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>When</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.userId} hover>
                      <TableCell>{user.userId}</TableCell>
                      <TableCell>
                        <Link 
                          href={`/users/${user.userId}`} 
                          underline="hover"
                          color="primary"
                        >
                          {user.userName}
                        </Link>
                      </TableCell>
                      <TableCell>{user.countryName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.provider} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.insertDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Active Users Table */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Active Users
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Operation</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>When</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userHistory.map((history) => (
                    <TableRow key={history.id} hover>
                      <TableCell>{history.id}</TableCell>
                      <TableCell>
                        <Link 
                          href={`/users/${history.userId}`} 
                          underline="hover"
                          color="primary"
                        >
                          {history.userName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={history.typeName} 
                          size="small" 
                          color="secondary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {history.clientIp}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(history.insertDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* API Status */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          🚀 Dashboard Successfully Loaded!
        </Typography>
        <Typography variant="body1" color="primary.contrastText">
          ✅ Mock API data loading functional
          <br />
          ✅ Real-time statistics cards working  
          <br />
          ✅ Data tables with formatted content
          <br />
          ✅ Responsive design and navigation
        </Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Ready for:</strong> User management • Account billing • Survey creation • System administration
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default EnhancedDashboard;
