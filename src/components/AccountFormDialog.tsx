import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Divider,
  Alert,
  Chip,
  FormGroup,
  Checkbox,
  Avatar,
  IconButton,
  Autocomplete
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  PersonRemove as PersonRemoveIcon
} from '@mui/icons-material';
import { Account, AccountForm, User } from '../types';
import { opinionApiService as ApiService } from '../services';

interface AccountFormDialogProps {
  open: boolean;
  account?: Account;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSave: (accountData: Partial<Account>) => Promise<void>;
}

// Mock data for dropdowns - in real app, these would come from API
const SERVICE_PACKAGES = [
  { id: 1, name: 'Basic' },
  { id: 2, name: 'Professional' },
  { id: 3, name: 'Enterprise' },
  { id: 4, name: 'Premium' }
];

const TIMEZONES = [
  { id: 1, name: 'UTC' },
  { id: 2, name: 'EST (UTC-5)' },
  { id: 3, name: 'PST (UTC-8)' },
  { id: 4, name: 'CET (UTC+1)' },
  { id: 5, name: 'JST (UTC+9)' }
];

const AVAILABLE_PERMISSIONS = [
  'CREATE_SURVEYS',
  'EDIT_SURVEYS',
  'DELETE_SURVEYS',
  'VIEW_REPORTS',
  'EXPORT_DATA',
  'MANAGE_USERS',
  'BILLING_ACCESS',
  'API_ACCESS'
];

const AccountFormDialog: React.FC<AccountFormDialogProps> = ({
  open,
  account,
  mode,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<AccountForm>({
    accountName: '',
    ownerId: undefined,
    packageId: 1,
    timezoneId: 1,
    isActive: true,
    permissions: [],
    inheritPermissions: false,
    companyName: '',
    contactEmail: '',
    contactName: '',
    planExpirationDate: '',
    remainingResponses: 1000
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [removeOwnerDialog, setRemoveOwnerDialog] = useState(false);

  // Load available users for owner selection
  useEffect(() => {
    if (open) {
      loadAvailableUsers();
    }
  }, [open]);

  const loadAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await ApiService.getUsers({ 
        page: 1, 
        limit: 1000, // Get all users
        status: 'active' // Only active users
      });
      // Filter to only non-admin users - handle paginated response structure
      const users = Array.isArray(response.data) ? response.data : (response.data?.list || []);
      const nonAdminUsers = users.filter(user => user.role !== 'admin');
      setAvailableUsers(nonAdminUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Initialize form data when account prop changes
  useEffect(() => {
    if (account && mode !== 'create') {
      setFormData({
        accountName: account.accountName || '',
        ownerId: account.ownerId,
        packageId: account.packageId || 1,
        timezoneId: account.timezoneId || 1,
        isActive: account.isActive,
        permissions: account.permissions || [],
        inheritPermissions: account.inheritPermissions || false,
        companyName: account.companyName || '',
        contactEmail: account.contactEmail || '',
        contactName: account.contactName || '',
        planExpirationDate: account.planExpirationDate || '',
        remainingResponses: account.remainingResponses || 1000
      });
    } else {
      // Reset form for create mode
      setFormData({
        accountName: '',
        ownerId: undefined,
        packageId: 1,
        timezoneId: 1,
        isActive: true,
        permissions: [],
        inheritPermissions: false,
        companyName: '',
        contactEmail: '',
        contactName: '',
        planExpirationDate: '',
        remainingResponses: 1000
      });
    }
    setErrors({});
  }, [account, mode]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    } else if (formData.accountName.trim().length < 2) {
      newErrors.accountName = 'Account name must be at least 2 characters';
    } else if (formData.accountName.trim().length > 32) {
      newErrors.accountName = 'Account name must be no more than 32 characters';
    }

    if (formData.contactEmail && formData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Please enter a valid email address';
      }
    }

    if (formData.remainingResponses !== undefined && formData.remainingResponses < 0) {
      newErrors.remainingResponses = 'Remaining responses cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof AccountForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle permission changes
  const handlePermissionChange = (permission: string, checked: boolean) => {
    const currentPermissions = formData.permissions || [];
    
    if (checked) {
      handleFieldChange('permissions', [...currentPermissions, permission]);
    } else {
      handleFieldChange('permissions', currentPermissions.filter(p => p !== permission));
    }
  };

  // Handle owner removal
  const handleRemoveOwner = () => {
    setRemoveOwnerDialog(true);
  };

  const confirmRemoveOwner = () => {
    handleFieldChange('ownerId', undefined);
    setRemoveOwnerDialog(false);
  };

  const cancelRemoveOwner = () => {
    setRemoveOwnerDialog(false);
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate avatar for account
  const generateAccountAvatar = (accountName: string): string => {
    const initials = accountName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1'];
    const colorIndex = accountName.length % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" fill="${backgroundColor}" rx="40"/>
        <text x="40" y="50" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  };

  const isReadOnly = mode === 'view';
  const dialogTitle = mode === 'create' ? 'Create Account' : mode === 'edit' ? 'Edit Account' : 'Account Details';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon />
          {dialogTitle}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Account Avatar and Basic Info */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={formData.accountName ? generateAccountAvatar(formData.accountName) : undefined}
                sx={{ width: 80, height: 80 }}
              >
                <BusinessIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {formData.accountName || 'New Account'}
                </Typography>
                {account && (
                  <Typography variant="body2" color="text.secondary">
                    Account ID: {account.accountId}
                  </Typography>
                )}
                {account && (
                  <Chip
                    label={account.isActive ? 'Active' : 'Inactive'}
                    color={account.isActive ? 'success' : 'error'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
          </Grid>

          {/* Account Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Account Name *"
              value={formData.accountName}
              onChange={(e) => handleFieldChange('accountName', e.target.value)}
              disabled={isReadOnly}
              error={!!errors.accountName}
              helperText={errors.accountName}
              placeholder="Enter account name"
            />
          </Grid>

          {/* Account Owner */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              fullWidth
              disabled={isReadOnly || loadingUsers}
              options={availableUsers}
              value={availableUsers.find(user => user.userId === formData.ownerId) || null}
              onChange={(_, newValue) => {
                handleFieldChange('ownerId', newValue?.userId || undefined);
              }}
              getOptionLabel={(option) => `${option.fullName} (@${option.username})`}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {option.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{option.username} • {option.email}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Account Owner (Optional)"
                  placeholder="Search for a user..."
                  helperText={
                    <Box>
                      {loadingUsers && (
                        <Typography variant="caption" color="text.secondary">
                          Loading users...
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block">
                        Only active non-admin users can be assigned as account owners
                      </Typography>
                    </Box>
                  }
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {formData.ownerId && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={handleRemoveOwner}
                            disabled={isReadOnly}
                            startIcon={<PersonRemoveIcon fontSize="small" />}
                            sx={{ mr: 1, minWidth: 'auto', fontSize: '0.75rem', py: 0.25, px: 1 }}
                          >
                            Remove
                          </Button>
                        )}
                        {params.InputProps.endAdornment}
                      </Box>
                    ),
                  }}
                />
              )}
              noOptionsText={loadingUsers ? "Loading users..." : "No users available"}
              clearOnBlur
              handleHomeEndKeys
            />
          </Grid>

          {/* Service Package */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Service Package</InputLabel>
              <Select
                value={formData.packageId}
                label="Service Package"
                onChange={(e) => handleFieldChange('packageId', e.target.value as number)}
                disabled={isReadOnly}
              >
                {SERVICE_PACKAGES.map(pkg => (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Timezone */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={formData.timezoneId}
                label="Timezone"
                onChange={(e) => handleFieldChange('timezoneId', e.target.value as number)}
                disabled={isReadOnly}
              >
                {TIMEZONES.map(tz => (
                  <MenuItem key={tz.id} value={tz.id}>
                    {tz.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Plan Expiration Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Plan Expiration Date"
              type="date"
              value={formData.planExpirationDate}
              onChange={(e) => handleFieldChange('planExpirationDate', e.target.value)}
              disabled={isReadOnly}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Remaining Responses */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Remaining Responses"
              type="number"
              value={formData.remainingResponses}
              onChange={(e) => handleFieldChange('remainingResponses', parseInt(e.target.value) || 0)}
              disabled={isReadOnly}
              error={!!errors.remainingResponses}
              helperText={errors.remainingResponses}
            />
          </Grid>

          {/* Contact Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => handleFieldChange('companyName', e.target.value)}
              disabled={isReadOnly}
              placeholder="Enter company name"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Name"
              value={formData.contactName}
              onChange={(e) => handleFieldChange('contactName', e.target.value)}
              disabled={isReadOnly}
              placeholder="Enter contact person name"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contact Email"
              value={formData.contactEmail}
              onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
              disabled={isReadOnly}
              error={!!errors.contactEmail}
              helperText={errors.contactEmail}
              placeholder="Enter contact email"
            />
          </Grid>

          {/* Permissions Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Permissions & Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.inheritPermissions}
                  onChange={(e) => handleFieldChange('inheritPermissions', e.target.checked)}
                  disabled={isReadOnly}
                />
              }
              label="Inherit Permissions from Parent"
            />
          </Grid>

          {!formData.inheritPermissions && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Account Permissions
              </Typography>
              <FormGroup row>
                {AVAILABLE_PERMISSIONS.map(permission => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Checkbox
                        checked={formData.permissions?.includes(permission) || false}
                        onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                        disabled={isReadOnly}
                      />
                    }
                    label={permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    sx={{ minWidth: '250px' }}
                  />
                ))}
              </FormGroup>
            </Grid>
          )}

          {/* Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                  disabled={isReadOnly}
                  color="success"
                />
              }
              label="Account Active"
            />
          </Grid>

          {/* Account Stats (View Mode Only) */}
          {mode === 'view' && account && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Account Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}>
                  <Typography variant="h4">{account.totalUsers || 0}</Typography>
                  <Typography variant="body2">Total Users</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 1 }}>
                  <Typography variant="h4">{account.totalSurveys || 0}</Typography>
                  <Typography variant="body2">Total Surveys</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
                  <Typography variant="h4">{account.totalResponses || 0}</Typography>
                  <Typography variant="body2">Total Responses</Typography>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {!isReadOnly && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={mode === 'create' ? <SaveIcon /> : <EditIcon />}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Account' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>

      {/* Remove Owner Confirmation Dialog */}
      <Dialog
        open={removeOwnerDialog}
        onClose={cancelRemoveOwner}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonRemoveIcon color="error" />
            Remove Account Owner
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Are you sure you want to remove the current owner from this account?
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {formData.ownerId && (
              <>The current owner is: <strong>
                {availableUsers.find(user => user.userId === formData.ownerId)?.fullName || 'Unknown User'}
              </strong></>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This account will have no assigned owner after this action. You can assign a new owner later if needed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveOwner}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmRemoveOwner}
            startIcon={<PersonRemoveIcon />}
          >
            Remove Owner
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AccountFormDialog;
