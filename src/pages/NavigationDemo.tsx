import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  Poll,
  CollectionsBookmark,
  Payment,
  MenuBook,
  Article,
  ContentCopy,
  Settings,
  MenuOpen,
  KeyboardArrowRight,
  Navigation,
} from '@mui/icons-material';
import { MENU_ITEMS } from '../constants';

const iconMap: Record<string, React.ElementType> = {
  Dashboard,
  People,
  Business,
  Poll,
  CollectionsBookmark,
  Payment,
  MenuBook,
  Article,
  ContentCopy,
  Settings,
};

const NavigationDemo: React.FC = () => {
  return (
    <Box className="content-container">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Navigation Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The admin interface features a comprehensive navigation system with collapsible sidebar and responsive design.
        </Typography>
      </Box>

      {/* Features Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MenuOpen sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Collapsible Sidebar</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Click the menu icon in the sidebar to collapse it to icons-only mode, saving screen space while keeping navigation accessible.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Navigation sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Responsive Design</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              On mobile devices, the navigation transforms into a slide-out drawer that can be opened with the hamburger menu.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <KeyboardArrowRight sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Active State Tracking</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              The navigation automatically highlights the current page and maintains visual feedback for user orientation.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Menu Structure */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Available Menu Items</Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>How to use:</strong> The navigation sidebar is always visible on the left side of the screen. 
          Click on any menu item to navigate to that section. Use the collapse button (☰) in the sidebar to minimize it.
        </Alert>

        <List>
          {MENU_ITEMS.map((item) => {
            const IconComponent = iconMap[item.icon];
            return (
              <ListItem key={item.key} sx={{ py: 1 }}>
                <ListItemIcon>
                  {IconComponent && <IconComponent color="primary" />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {item.label}
                      </Typography>
                      <Chip 
                        label={item.path} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {item.key === 'dashboard' && 'Overview of system statistics and recent activity'}
                      {item.key === 'users' && 'Manage user accounts, permissions, and details'}
                      {item.key === 'accounts' && 'Manage client accounts and subscription plans'}
                      {item.key === 'surveys' && 'Create and manage survey campaigns'}
                      {item.key === 'collectors' && 'Manage data collection methods and sources'}
                      {item.key === 'billing' && 'Payment processing and billing management'}
                      {item.key === 'knowledge-base' && 'Documentation and help resources'}
                      {item.key === 'blog' && 'Content management and blog posts'}
                      {item.key === 'content' && 'Static content and media management'}
                      {item.key === 'setup' && 'System configuration and settings'}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {/* Navigation Tips */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Navigation Tips</Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Keyboard Navigation:</strong> Use Tab to navigate through menu items, Enter to select
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Mobile Usage:</strong> Swipe from left edge or tap hamburger menu to open navigation
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Breadcrumbs:</strong> Each page shows breadcrumb navigation for easy backtracking
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>User Menu:</strong> Access profile, settings, and logout from the avatar in the top-right corner
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Direct URLs:</strong> Each section supports direct URL access for bookmarking
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default NavigationDemo;
