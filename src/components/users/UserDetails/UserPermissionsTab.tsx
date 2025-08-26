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
  Checkbox,
  Button,
  FormControlLabel,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { opinionApiService } from '../../../services';

interface Permission {
  scope: string;
  description: string;
  granted: boolean;
}

interface UserPermissionsTabProps {
  userId: string;
}

const UserPermissionsTab: React.FC<UserPermissionsTabProps> = ({ userId }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, [userId]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await opinionApiService.getUserPermissions(parseInt(userId));
      // Handle response structure
      if (response.success && response.data) {
        setPermissions(response.data as Permission[] || []);
      } else {
        throw new Error('Failed to load user permissions');
      }
      setHasChanges(false);
    } catch (err: any) {
      console.error('Failed to load user permissions:', err);
      setError(err.message || 'Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (scope: string, granted: boolean) => {
    setPermissions(prev => 
      prev.map(permission => 
        permission.scope === scope 
          ? { ...permission, granted }
          : permission
      )
    );
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const grantedScopes = permissions
        .filter(p => p.granted)
        .map(p => p.scope);
      
      await opinionApiService.updateUserPermissions(parseInt(userId), grantedScopes);
      toast.success('Permissions updated successfully');
      setHasChanges(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadPermissions();
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">User Permissions</Typography>
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

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : permissions.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                No permissions configured for this user.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Scope</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Granted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.scope} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {permission.scope}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {permission.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={permission.granted}
                              onChange={(e) => handlePermissionChange(permission.scope, e.target.checked)}
                              disabled={saving}
                            />
                          }
                          label=""
                          sx={{ m: 0 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserPermissionsTab;
