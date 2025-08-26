import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { User } from '../../../types';
import { opinionApiService } from '../../../services';

interface UserPasswordTabProps {
  user: User;
}

const UserPasswordTab: React.FC<UserPasswordTabProps> = ({ user }) => {
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmNewPassword: '',
    userMustChangePassword: true,
    sendNotificationResetPassword: false,
  });

  const handlePasswordChange = (field: string, value: any) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleResetPassword = async () => {
    if (passwordData.newPassword.length < 6 || passwordData.newPassword.length > 12) {
      toast.error('Password must be between 6-12 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // TODO: Implement resetPassword API method
      toast.success('Password reset functionality not implemented yet');
      setPasswordData({
        newPassword: '',
        confirmNewPassword: '',
        userMustChangePassword: true,
        sendNotificationResetPassword: false,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mt: 3 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#666' }}>
          Reset Password for {user.displayName || user.userName}
        </Typography>

        <Box className="params" sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Box className="param-name" sx={{ fontWeight: 'bold', mb: 1 }}>
            * New Password:
          </Box>
          <Box className="param-value">
            <TextField
              type="password"
              size="small"
              fullWidth
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              inputProps={{ maxLength: 12 }}
            />
            <Box sx={{ fontSize: '0.8em', color: '#999', mt: 0.5 }}>
              (Password must be between 6-12 characters.)
            </Box>
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Box className="param-name" sx={{ fontWeight: 'bold', mb: 1 }}>
            * Confirm Password:
          </Box>
          <Box className="param-value">
            <TextField
              type="password"
              size="small"
              fullWidth
              value={passwordData.confirmNewPassword}
              onChange={(e) => handlePasswordChange('confirmNewPassword', e.target.value)}
              inputProps={{ maxLength: 12 }}
            />
          </Box>
        </Box>

        <Box className="params" sx={{ display: 'flex', flexDirection: 'column', mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={passwordData.userMustChangePassword}
                onChange={(e) => handlePasswordChange('userMustChangePassword', e.target.checked)}
              />
            }
            label="User must change password after login"
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={passwordData.sendNotificationResetPassword}
                onChange={(e) => handlePasswordChange('sendNotificationResetPassword', e.target.checked)}
              />
            }
            label="Send user notification about reset change"
          />
        </Box>

        <Box sx={{ textAlign: 'left' }}>
          <Button
            variant="contained"
            onClick={handleResetPassword}
            className="btn-action"
            sx={{
              backgroundColor: '#4A90E2',
              '&:hover': { backgroundColor: '#357ABD' },
              textTransform: 'none',
              minWidth: 140,
            }}
          >
            Reset Password
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UserPasswordTab;
