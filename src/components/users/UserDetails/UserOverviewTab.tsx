import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { User } from '../../../types';

interface UserOverviewTabProps {
  user: User;
}

const UserOverviewTab: React.FC<UserOverviewTabProps> = ({ user }) => {
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return value;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Contact Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Contact
            </Typography>
            <Box component="dl" sx={{ mt: 2 }}>
              <Box display="flex" mb={1}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Full Name:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                  {formatValue(user.fullName)}
                </Typography>
              </Box>
              <Box display="flex" mb={1}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Email:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                  {formatValue(user.email)}
                </Typography>
              </Box>
              <Box display="flex" mb={1}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Phone:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                  {formatValue(user.phone)}
                </Typography>
              </Box>
              <Box display="flex" mb={1}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Locale:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                  {formatValue(user.locale)}
                </Typography>
              </Box>
              <Box display="flex" mb={1}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Timezone:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                  {formatValue(user.timezone)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Account
            </Typography>
            <Box component="dl" sx={{ mt: 2 }}>
              <Box display="flex" mb={1} alignItems="center">
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Role(s):
                </Typography>
                <Box component="dd" sx={{ ml: 1 }}>
                  <Chip 
                    label={user.role}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Box display="flex" mb={1} alignItems="center">
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Status:
                </Typography>
                <Box component="dd" sx={{ ml: 1 }}>
                  <Chip 
                    label={user.status}
                    size="small"
                    color={
                      user.status === 'active' ? 'success' : 
                      user.status === 'pending' ? 'warning' : 'default'
                    }
                  />
                </Box>
              </Box>
              <Box display="flex" mb={1}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Email Verified:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                  {user.emailVerified ? 'Yes' : 'No'}
                </Typography>
              </Box>
              <Box display="flex" mb={1}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  MFA Enabled:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                  {user.mfaEnabled ? 'Yes' : 'No'}
                </Typography>
              </Box>
              <Box display="flex" mb={1}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Created:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                  {formatDate(user.createdAt)}
                </Typography>
              </Box>
              <Box display="flex" mb={1}>
                <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Last Login:
                </Typography>
                <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                  {formatDate(user.lastLoginAt)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Additional Information */}
      {(user.companyName || user.planName || (user.tags && user.tags.length > 0)) && (
        <Card>
          <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Additional Information
              </Typography>
              <Box component="dl" sx={{ mt: 2 }}>
                {user.companyName && (
                  <Box display="flex" mb={1}>
                    <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                      Company:
                    </Typography>
                    <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                      {user.companyName}
                    </Typography>
                  </Box>
                )}
                {user.planName && (
                  <Box display="flex" mb={1}>
                    <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                      Plan:
                    </Typography>
                    <Typography component="dd" variant="body2" sx={{ ml: 1 }}>
                      {user.planName}
                    </Typography>
                  </Box>
                )}
                {user.tags && user.tags.length > 0 && (
                  <Box display="flex" mb={1} alignItems="flex-start">
                    <Typography component="dt" variant="body2" color="text.secondary" sx={{ minWidth: 120, pt: 0.5 }}>
                      Tags:
                    </Typography>
                    <Box component="dd" sx={{ ml: 1 }}>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {user.tags.map((tag, index) => (
                          <Chip 
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
      )}
    </Box>
  );
};

export default UserOverviewTab;
