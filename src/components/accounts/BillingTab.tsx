import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { opinionApiService as apiService } from '../../services';
import { countries, getStatesByCountryId, hasStates } from '../../data/countries';

interface BillingSettings {
  currencyCode: string;
  minDeposit: number;
  maxDeposit: number;
  taxable: boolean;
}

interface BusinessDetails {
  companyName: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  countryId: number;
  stateId: number | null;
  postalCode: string;
  phone1: string;
}

interface Country {
  id: number;
  name: string;
  code: string;
}

interface State {
  id: number;
  name: string;
  countryId: number;
}

interface BillingTabProps {
  accountId: number;
}

export const BillingTab: React.FC<BillingTabProps> = ({ accountId }) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data state
  const [billingSettings, setBillingSettings] = useState<BillingSettings>({
    currencyCode: 'USD',
    minDeposit: 0,
    maxDeposit: 10000,
    taxable: false,
  });

  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    companyName: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    countryId: 232, // United States default
    stateId: null,
    postalCode: '',
    phone1: '',
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load business details on component mount
  useEffect(() => {
    loadBusinessDetails();
  }, [accountId]);

  const loadBusinessDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the API using the original structure: accounts.getBusinessDetails with accountId
      const response = await apiService.getBusinessDetails(accountId);
      
      if (response.success && response.data) {
        const details = response.data;
        
        // Update business details
        setBusinessDetails({
          companyName: details.companyName || '',
          firstName: details.firstName || '',
          lastName: details.lastName || '',
          address1: details.address1 || '',
          address2: details.address2 || '',
          city: details.city || '',
          countryId: details.countryId || 232, // Default to US
          stateId: details.stateId || null,
          postalCode: details.postalCode || '',
          phone1: details.phone1 || '',
        });

        // Set billing settings if available in response
        if (details.currencyCode || details.minDeposit !== undefined || details.maxDeposit !== undefined || details.taxable !== undefined) {
          setBillingSettings({
            currencyCode: details.currencyCode || 'USD',
            minDeposit: details.minDeposit || 0,
            maxDeposit: details.maxDeposit || 10000,
            taxable: details.taxable || false,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!businessDetails.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    
    if (!businessDetails.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!businessDetails.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!businessDetails.address1.trim()) {
      errors.address1 = 'Address is required';
    }
    
    if (!businessDetails.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!businessDetails.postalCode.trim()) {
      errors.postalCode = 'ZIP/Postal code is required';
    }

    // Currency validation
    if (billingSettings.minDeposit < 0) {
      errors.minDeposit = 'Minimum deposit cannot be negative';
    }
    
    if (billingSettings.maxDeposit < 0) {
      errors.maxDeposit = 'Maximum deposit cannot be negative';
    }
    
    if (billingSettings.minDeposit >= billingSettings.maxDeposit) {
      errors.maxDeposit = 'Maximum deposit must be greater than minimum deposit';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setError('Please correct the errors below');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update business details
      await apiService.updateBusinessDetails(accountId, businessDetails);
      
      // Update billing settings
      await apiService.updateBillingSettings(accountId, billingSettings);

      setSuccess('Billing information updated successfully');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to update billing information');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    loadBusinessDetails();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={saving}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Billing Settings Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Billing Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Billing ID"
                    value={accountId}
                    disabled
                    helperText="Read-only account billing identifier"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Taxable</InputLabel>
                    <Select
                      value={billingSettings.taxable ? 'yes' : 'no'}
                      onChange={(e) => setBillingSettings(prev => ({ 
                        ...prev, 
                        taxable: e.target.value === 'yes' 
                      }))}
                      label="Taxable"
                    >
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Currency Code</InputLabel>
                    <Select
                      value={billingSettings.currencyCode}
                      onChange={(e) => setBillingSettings(prev => ({ 
                        ...prev, 
                        currencyCode: e.target.value 
                      }))}
                      label="Currency Code"
                    >
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                      <MenuItem value="EUR">EUR - Euro</MenuItem>
                      <MenuItem value="GBP">GBP - British Pound</MenuItem>
                      <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Deposit"
                    value={billingSettings.minDeposit}
                    onChange={(e) => setBillingSettings(prev => ({ 
                      ...prev, 
                      minDeposit: parseFloat(e.target.value) || 0 
                    }))}
                    error={!!validationErrors.minDeposit}
                    helperText={validationErrors.minDeposit}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {billingSettings.currencyCode === 'USD' ? '$' : 
                           billingSettings.currencyCode === 'EUR' ? '€' : 
                           billingSettings.currencyCode === 'GBP' ? '£' : 
                           billingSettings.currencyCode}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Deposit"
                    value={billingSettings.maxDeposit}
                    onChange={(e) => setBillingSettings(prev => ({ 
                      ...prev, 
                      maxDeposit: parseFloat(e.target.value) || 0 
                    }))}
                    error={!!validationErrors.maxDeposit}
                    helperText={validationErrors.maxDeposit}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {billingSettings.currencyCode === 'USD' ? '$' : 
                           billingSettings.currencyCode === 'EUR' ? '€' : 
                           billingSettings.currencyCode === 'GBP' ? '£' : 
                           billingSettings.currencyCode}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Information Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Business Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={businessDetails.companyName}
                    onChange={(e) => setBusinessDetails(prev => ({ 
                      ...prev, 
                      companyName: e.target.value 
                    }))}
                    error={!!validationErrors.companyName}
                    helperText={validationErrors.companyName}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={businessDetails.firstName}
                    onChange={(e) => setBusinessDetails(prev => ({ 
                      ...prev, 
                      firstName: e.target.value 
                    }))}
                    error={!!validationErrors.firstName}
                    helperText={validationErrors.firstName}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={businessDetails.lastName}
                    onChange={(e) => setBusinessDetails(prev => ({ 
                      ...prev, 
                      lastName: e.target.value 
                    }))}
                    error={!!validationErrors.lastName}
                    helperText={validationErrors.lastName}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 1"
                    value={businessDetails.address1}
                    onChange={(e) => setBusinessDetails(prev => ({ 
                      ...prev, 
                      address1: e.target.value 
                    }))}
                    error={!!validationErrors.address1}
                    helperText={validationErrors.address1}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 2 (Optional)"
                    value={businessDetails.address2}
                    onChange={(e) => setBusinessDetails(prev => ({ 
                      ...prev, 
                      address2: e.target.value 
                    }))}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={businessDetails.city}
                    onChange={(e) => setBusinessDetails(prev => ({ 
                      ...prev, 
                      city: e.target.value 
                    }))}
                    error={!!validationErrors.city}
                    helperText={validationErrors.city}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ZIP / Postal Code"
                    value={businessDetails.postalCode}
                    onChange={(e) => setBusinessDetails(prev => ({ 
                      ...prev, 
                      postalCode: e.target.value 
                    }))}
                    error={!!validationErrors.postalCode}
                    helperText={validationErrors.postalCode}
                    required
                  />
                </Grid>
                
                {/* Country and State fields */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={businessDetails.countryId}
                      onChange={(e) => setBusinessDetails(prev => ({ 
                        ...prev, 
                        countryId: Number(e.target.value),
                        stateId: null // Reset state when country changes
                      }))}
                      label="Country"
                    >
                      {countries.map(country => (
                        <MenuItem key={country.id} value={country.id}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!hasStates(businessDetails.countryId)}>
                    <InputLabel>State / Province</InputLabel>
                    <Select
                      value={businessDetails.stateId || ''}
                      onChange={(e) => setBusinessDetails(prev => ({ 
                        ...prev, 
                        stateId: e.target.value ? Number(e.target.value) : null
                      }))}
                      label="State / Province"
                    >
                      {getStatesByCountryId(businessDetails.countryId).map(state => (
                        <MenuItem key={state.id} value={state.id}>
                          {state.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {!hasStates(businessDetails.countryId) && (
                      <FormHelperText>Not applicable for selected country</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={businessDetails.phone1}
                    onChange={(e) => setBusinessDetails(prev => ({ 
                      ...prev, 
                      phone1: e.target.value 
                    }))}
                    placeholder="+1-555-123-4567"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BillingTab;
