import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Typography,
  Chip,
  FormHelperText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Account } from '../../types';
import { validateEmail } from '../../utils';

interface AccountFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (accountData: Partial<Account>) => void;
  account: Account | null;
  mode: 'create' | 'edit';
}

interface FormData {
  accountName: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  planId: number;
  planName: string;
  isActive: boolean;
}

interface FormErrors {
  accountName?: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  planId?: string;
}

const PLANS = [
  { id: 1, name: 'Basic', description: 'Up to 10 surveys, 1,000 responses/month', color: 'default' as const },
  { id: 2, name: 'Professional', description: 'Up to 50 surveys, 10,000 responses/month', color: 'secondary' as const },
  { id: 3, name: 'Premium', description: 'Up to 100 surveys, 25,000 responses/month', color: 'success' as const },
  { id: 4, name: 'Enterprise', description: 'Unlimited surveys and responses', color: 'primary' as const },
];

const AccountFormDialog: React.FC<AccountFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  account,
  mode,
}) => {
  const [formData, setFormData] = useState<FormData>({
    accountName: '',
    companyName: '',
    contactName: '',
    contactEmail: '',
    planId: 1,
    planName: 'Basic',
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or account changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && account) {
        setFormData({
          accountName: account.accountName,
          companyName: account.companyName || '',
          contactName: account.contactName,
          contactEmail: account.contactEmail,
          planId: account.planId,
          planName: account.planName,
          isActive: account.isActive,
        });
      } else {
        setFormData({
          accountName: '',
          companyName: '',
          contactName: '',
          contactEmail: '',
          planId: 1,
          planName: 'Basic',
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [open, mode, account]);

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Handle plan selection
    if (field === 'planId') {
      const selectedPlan = PLANS.find(plan => plan.id === Number(value));
      if (selectedPlan) {
        setFormData(prev => ({ ...prev, planId: selectedPlan.id, planName: selectedPlan.name }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Account name validation
    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    } else if (formData.accountName.length < 3) {
      newErrors.accountName = 'Account name must be at least 3 characters';
    }

    // Company name validation (optional but must be valid if provided)
    if (formData.companyName && formData.companyName.length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    // Contact name validation
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    } else if (formData.contactName.length < 2) {
      newErrors.contactName = 'Contact name must be at least 2 characters';
    }

    // Contact email validation
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!validateEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    // Plan validation
    if (!formData.planId) {
      newErrors.planId = 'Please select a plan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const accountData: Partial<Account> = {
        accountName: formData.accountName,
        companyName: formData.companyName || undefined,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        planId: formData.planId,
        planName: formData.planName,
        isActive: formData.isActive,
      };

      await onSubmit(accountData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const selectedPlan = PLANS.find(plan => plan.id === formData.planId);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" />
          <Box>
            <Typography variant="h6">
              {mode === 'create' ? 'Create New Account' : 'Edit Account'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mode === 'create' 
                ? 'Set up a new client account with subscription plan'
                : 'Update account information and settings'
              }
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon fontSize="small" />
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Account Name"
              value={formData.accountName}
              onChange={handleInputChange('accountName')}
              error={!!errors.accountName}
              helperText={errors.accountName || 'Internal name for this account'}
              disabled={loading}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={formData.companyName}
              onChange={handleInputChange('companyName')}
              error={!!errors.companyName}
              helperText={errors.companyName || 'Client company name (optional)'}
              disabled={loading}
            />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <PersonIcon fontSize="small" />
              Primary Contact
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Name"
              value={formData.contactName}
              onChange={handleInputChange('contactName')}
              error={!!errors.contactName}
              helperText={errors.contactName}
              disabled={loading}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Email"
              type="email"
              value={formData.contactEmail}
              onChange={handleInputChange('contactEmail')}
              error={!!errors.contactEmail}
              helperText={errors.contactEmail}
              disabled={loading}
              required
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />,
              }}
            />
          </Grid>

          {/* Subscription Plan */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Subscription Plan
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Plan"
              value={formData.planId}
              onChange={handleInputChange('planId')}
              error={!!errors.planId}
              helperText={errors.planId}
              disabled={loading}
              required
            >
              {PLANS.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {plan.description}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={plan.name}
                      color={plan.color}
                      variant={plan.name === 'Basic' ? 'outlined' : 'filled'}
                    />
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {selectedPlan && (
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">Selected Plan</Typography>
                  <Chip
                    size="small"
                    label={selectedPlan.name}
                    color={selectedPlan.color}
                    variant={selectedPlan.name === 'Basic' ? 'outlined' : 'filled'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {selectedPlan.description}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Account Status */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    disabled={loading}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      Account Active
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.isActive 
                        ? 'Account is active and can access services'
                        : 'Account is suspended and cannot access services'
                      }
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Account' : 'Update Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountFormDialog;
