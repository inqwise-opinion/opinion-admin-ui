import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { opinionApiService } from '../../../services';

interface NotificationSettings {
  email: {
    security: boolean;
    billing: boolean;
    product: boolean;
    marketing: boolean;
    surveys: boolean;
    reports: boolean;
  };
  push: {
    security: boolean;
    surveys: boolean;
    reports: boolean;
  };
  sms: {
    security: boolean;
    billing: boolean;
  };
}

interface UserNotificationsTabProps {
  userId: string;
}

const UserNotificationsTab: React.FC<UserNotificationsTabProps> = ({ userId }) => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await opinionApiService.getUserNotificationSettings(parseInt(userId));
      // Handle response structure
      if (response.success && response.data) {
        setSettings(response.data as NotificationSettings);
      } else {
        throw new Error('Failed to load notification settings');
      }
      setHasChanges(false);
    } catch (err: any) {
      console.error('Failed to load notification settings:', err);
      setError(err.message || 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category: keyof NotificationSettings, setting: string, value: boolean) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await opinionApiService.updateUserNotificationSettings(parseInt(userId), settings);
      toast.success('Notification preferences updated successfully');
      setHasChanges(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (loading || !settings) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Notification Preferences</Typography>
        <Box display="flex" gap={1}>
          {hasChanges && (
            <Button variant="outlined" onClick={handleReset} disabled={saving}>
              Reset
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={handleSaveChanges}
            disabled={!hasChanges || saving}
          >
            {saving && <CircularProgress size={20} sx={{ mr: 1 }} />}
            Save Changes
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Email Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Email Notifications
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.security}
                      onChange={(e) => handleSettingChange('email', 'security', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Security alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.billing}
                      onChange={(e) => handleSettingChange('email', 'billing', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Billing alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.product}
                      onChange={(e) => handleSettingChange('email', 'product', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Product updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.marketing}
                      onChange={(e) => handleSettingChange('email', 'marketing', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Marketing communications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.surveys}
                      onChange={(e) => handleSettingChange('email', 'surveys', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Survey notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.reports}
                      onChange={(e) => handleSettingChange('email', 'reports', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Report notifications"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Push Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Push Notifications
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.push.security}
                      onChange={(e) => handleSettingChange('push', 'security', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Security alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.push.surveys}
                      onChange={(e) => handleSettingChange('push', 'surveys', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Survey notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.push.reports}
                      onChange={(e) => handleSettingChange('push', 'reports', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Report notifications"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SMS Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                SMS Notifications
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.sms.security}
                      onChange={(e) => handleSettingChange('sms', 'security', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Security alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.sms.billing}
                      onChange={(e) => handleSettingChange('sms', 'billing', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Billing alerts"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Alert severity="info">
          <Typography variant="body2">
            These settings control what notifications this user receives. Changes take effect immediately.
            Users can also manage their own notification preferences from their account settings.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default UserNotificationsTab;
