import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { format } from 'date-fns';
import { Delete, Refresh, Security, Warning } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { opinionApiService } from '../../services';

interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastSeen: string;
  isCurrent: boolean;
  isActive: boolean;
}

interface SecurityInfo {
  lastPasswordChange?: string;
  mfaEnabled: boolean;
  accountLocked: boolean;
  failedLoginAttempts: number;
  lastFailedLogin?: string;
  securityScore: number;
}

interface UserSecurityTabProps {
  userId: string;
}

const UserSecurityTab: React.FC<UserSecurityTabProps> = ({ userId }) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeAllDialogOpen, setRevokeAllDialogOpen] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, [userId]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sessionsResponse, securityResponse] = await Promise.all([
        opinionApiService.getUserSessions(userId),
        opinionApiService.getUserSecurity(userId)
      ]);
      setSessions(sessionsResponse.data || []);
      setSecurityInfo(securityResponse);
    } catch (err: any) {
      console.error('Failed to load security data:', err);
      setError(err.message || 'Failed to load security information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await opinionApiService.revokeUserSession(userId, sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Session revoked successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      setRevokingAll(true);
      await opinionApiService.revokeAllUserSessions(userId);
      setSessions([]);
      setRevokeAllDialogOpen(false);
      toast.success('All sessions revoked successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke sessions');
    } finally {
      setRevokingAll(false);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Security & Sessions
      </Typography>

      {/* Security Overview */}
      {securityInfo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Overview
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Security Score
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">
                    {securityInfo.securityScore}/100
                  </Typography>
                  <Chip
                    label={getSecurityScoreLabel(securityInfo.securityScore)}
                    size="small"
                    color={getSecurityScoreColor(securityInfo.securityScore)}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  MFA Status
                </Typography>
                <Chip
                  icon={<Security />}
                  label={securityInfo.mfaEnabled ? 'Enabled' : 'Disabled'}
                  size="small"
                  color={securityInfo.mfaEnabled ? 'success' : 'default'}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Account Status
                </Typography>
                <Chip
                  label={securityInfo.accountLocked ? 'Locked' : 'Active'}
                  size="small"
                  color={securityInfo.accountLocked ? 'error' : 'success'}
                  icon={securityInfo.accountLocked ? <Warning /> : undefined}
                />
              </Box>
              {securityInfo.lastPasswordChange && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Password Change
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(securityInfo.lastPasswordChange)}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Failed Login Attempts
                </Typography>
                <Typography variant="body2">
                  {securityInfo.failedLoginAttempts}
                </Typography>
              </Box>
              {securityInfo.lastFailedLogin && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Failed Login
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(securityInfo.lastFailedLogin)}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Active Sessions ({sessions.length})
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadSecurityData}
                size="small"
              >
                Refresh
              </Button>
              {sessions.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setRevokeAllDialogOpen(true)}
                  size="small"
                >
                  Revoke All Sessions
                </Button>
              )}
            </Box>
          </Box>

          {sessions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No active sessions found for this user.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Device</TableCell>
                    <TableCell>Last Seen</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {session.device}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.browser} on {session.os}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(session.lastSeen)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {session.ipAddress}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {session.location || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          {session.isCurrent && (
                            <Chip label="Current" size="small" color="primary" />
                          )}
                          <Chip 
                            label={session.isActive ? 'Active' : 'Inactive'} 
                            size="small" 
                            color={session.isActive ? 'success' : 'default'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={session.isCurrent}
                          title={session.isCurrent ? 'Cannot revoke current session' : 'Revoke session'}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Revoke All Sessions Dialog */}
      <Dialog
        open={revokeAllDialogOpen}
        onClose={() => setRevokeAllDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Revoke All Sessions</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to revoke all active sessions for this user? This will force them to log in again on all devices. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRevokeAllDialogOpen(false)}
            disabled={revokingAll}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRevokeAllSessions}
            color="error"
            variant="contained"
            disabled={revokingAll}
          >
            {revokingAll && <CircularProgress size={20} sx={{ mr: 1 }} />}
            Revoke All Sessions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserSecurityTab;
