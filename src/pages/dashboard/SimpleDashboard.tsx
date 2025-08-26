import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  People,
  Business,
  Poll,
  AttachMoney,
  TrendingUp,
  PersonAdd,
} from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'primary.main',
}) => {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
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

const SimpleDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Users"
            value={12}
            icon={<PersonAdd />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={348}
            icon={<People />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Accounts"
            value={50}
            icon={<Business />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value="$15,250"
            icon={<AttachMoney />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Surveys"
            value={75}
            icon={<Poll />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Responses"
            value="12,450"
            icon={<TrendingUp />}
            color="success.main"
          />
        </Grid>
      </Grid>

      {/* Sample Tables */}
      <Grid container spacing={3}>
        {/* Recent Users Table */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2, minHeight: 400 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Today At a Glance
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Recent user registrations and activity will be displayed here.
              </Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption">
                  📊 Data tables with sorting and filtering
                  <br />
                  👥 User registration tracking
                  <br />
                  🌍 Geographic distribution
                  <br />
                  📈 Real-time statistics
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Active Users Table */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2, minHeight: 400 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Active Users
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Active user sessions and recent activities will be shown here.
              </Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption">
                  🔄 Live activity monitoring
                  <br />
                  📱 Session tracking
                  <br />
                  🔍 Operation logging
                  <br />
                  ⏰ Timestamp tracking
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Status Info */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'success.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          🎉 Opinion Admin Dashboard is Running!
        </Typography>
        <Typography variant="body1">
          ✅ React + TypeScript application loaded successfully
          <br />
          ✅ Material-UI components rendered properly
          <br />
          ✅ Responsive layout working on desktop and mobile
          <br />
          ✅ Navigation and routing system functional
        </Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Next Steps:</strong>
            <br />
            • Connect to real API endpoints
            <br />
            • Implement data tables with mock data
            <br />
            • Add user management functionality
            <br />
            • Create account and survey management pages
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SimpleDashboard;
