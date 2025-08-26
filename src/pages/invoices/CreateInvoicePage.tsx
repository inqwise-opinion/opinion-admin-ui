import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Checkbox,
  Divider,
  Link as MUILink,
} from '@mui/material';
import { ArrowBack, Save as SaveIcon, Send as SendIcon } from '@mui/icons-material';
import opinionApiService from '../../services';
import { ROUTES } from '../../constants';
import { useSetBreadcrumbs } from '../../contexts/BreadcrumbContext';

interface BillingAddress {
  businessName?: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  countryId?: number;
  stateId?: number;
  postalCode?: string;
  phone1?: string;
}

interface InvoiceCharge {
  id: string;
  chargeDate?: string;
  name?: string;
  description?: string;
  chargeId?: number;
  amount?: number;
  quantity?: number;
  unitPrice?: number;
}

interface Country {
  id: number;
  name: string;
  iso2: string;
}

interface State {
  id: number;
  name: string;
}

const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('account_id') ? parseInt(searchParams.get('account_id')!) : 1;
  const { setBreadcrumbs, clearBreadcrumbs } = useSetBreadcrumbs();

  // Form state
  const [billingPeriodFrom, setBillingPeriodFrom] = useState<string>('');
  const [billingPeriodTo, setBillingPeriodTo] = useState<string>('');
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({});
  const [notes, setNotes] = useState<string>('');
  const [charges, setCharges] = useState<InvoiceCharge[]>([]);
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string>('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [showStateField, setShowStateField] = useState(false);
  const [showProvinceField, setShowProvinceField] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, [accountId]);

  useEffect(() => {
    if (billingAddress.countryId) {
      handleCountryChange(billingAddress.countryId);
    }
  }, [billingAddress.countryId]);

  // Cleanup breadcrumbs on unmount
  useEffect(() => {
    return () => {
      clearBreadcrumbs();
    };
  }, [clearBreadcrumbs]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load account details and available charges
      const [accountResponse, chargesResponse] = await Promise.all([
        opinionApiService.getAccountDetails(accountId),
        opinionApiService.getUninvoicedCharges(accountId),
      ]);

      if (accountResponse.success && accountResponse.data) {
        const loadedAccountName = accountResponse.data.accountName || 'Unknown Account';
        setAccountName(loadedAccountName);
        
        // Set custom breadcrumbs to hide MainLayout's "Home" breadcrumb
        setBreadcrumbs([
          {
            label: 'Accounts',
            onClick: () => navigate(ROUTES.ACCOUNTS)
          },
          {
            label: loadedAccountName,
            onClick: () => navigate(`/accounts/${accountId}`)
          },
          {
            label: 'Invoices',
            onClick: () => {
              const searchParams = new URLSearchParams({ tab: 'invoices' });
              navigate(`/accounts/${accountId}?${searchParams.toString()}`);
            }
          },
          {
            label: 'New Invoice'
          }
        ]);
      }

      if (chargesResponse.success && chargesResponse.data?.list) {
        setCharges(chargesResponse.data.list);
      }

      // Set default billing period (current month)
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setBillingPeriodFrom(firstDay.toISOString().split('T')[0]);
      setBillingPeriodTo(lastDay.toISOString().split('T')[0]);

      // Mock countries data - in real implementation, load from API
      setCountries([
        { id: 232, name: 'United States', iso2: 'US' },
        { id: 39, name: 'Canada', iso2: 'CA' },
        { id: 105, name: 'Israel', iso2: 'IL' },
        { id: 230, name: 'United Kingdom', iso2: 'GB' },
        // Add more countries as needed
      ]);

    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (countryId: number) => {
    setBillingAddress(prev => ({ ...prev, countryId, stateId: undefined }));
    
    if (countryId === 232) { // United States
      setShowStateField(true);
      setShowProvinceField(false);
      // Mock US states - in real implementation, load from API
      setStates([
        { id: 1, name: 'Alabama' },
        { id: 2, name: 'Alaska' },
        { id: 3, name: 'Arizona' },
        { id: 4, name: 'California' },
        { id: 5, name: 'Florida' },
        { id: 6, name: 'New York' },
        { id: 7, name: 'Texas' },
        // Add more states
      ]);
    } else if (countryId === 39) { // Canada
      setShowStateField(false);
      setShowProvinceField(true);
      // Mock Canadian provinces
      setStates([
        { id: 1, name: 'Ontario' },
        { id: 2, name: 'Quebec' },
        { id: 3, name: 'British Columbia' },
        { id: 4, name: 'Alberta' },
        // Add more provinces
      ]);
    } else {
      setShowStateField(false);
      setShowProvinceField(false);
      setStates([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!billingAddress.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!billingAddress.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!billingAddress.address1?.trim()) {
      errors.address1 = 'Address line 1 is required';
    }
    if (!billingAddress.city?.trim()) {
      errors.city = 'City is required';
    }
    if (!billingAddress.countryId) {
      errors.country = 'Country is required';
    }
    if ((showStateField || showProvinceField) && !billingAddress.stateId) {
      errors.state = showStateField ? 'State is required' : 'Province is required';
    }
    if (!billingAddress.postalCode?.trim()) {
      errors.zip = 'ZIP code is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAsDraft = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await opinionApiService.createInvoice({
        accountId,
        statusId: 1, // Draft
        companyName: billingAddress.businessName,
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        address1: billingAddress.address1,
        address2: billingAddress.address2,
        city: billingAddress.city,
        countryId: billingAddress.countryId,
        stateId: billingAddress.stateId,
        postalCode: billingAddress.postalCode,
        phone1: billingAddress.phone1,
        notes,
        fromDate: billingPeriodFrom + ' 00:00',
        toDate: billingPeriodTo + ' 23:59',
        charges: selectedCharges.map(id => parseInt(id)),
      });

      if (response.success && response.data?.invoiceId) {
        navigate(`/account-details/invoices/${response.data.invoiceId}?account_id=${accountId}`);
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenInvoice = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await opinionApiService.createInvoice({
        accountId,
        statusId: 2, // Open
        companyName: billingAddress.businessName,
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        address1: billingAddress.address1,
        address2: billingAddress.address2,
        city: billingAddress.city,
        countryId: billingAddress.countryId,
        stateId: billingAddress.stateId,
        postalCode: billingAddress.postalCode,
        phone1: billingAddress.phone1,
        notes,
        fromDate: billingPeriodFrom + ' 00:00',
        toDate: billingPeriodTo + ' 23:59',
        charges: selectedCharges.map(id => parseInt(id)),
      });

      if (response.success && response.data?.invoiceId) {
        navigate(`/account-details/invoices/${response.data.invoiceId}?account_id=${accountId}`);
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleChargeSelection = (chargeId: string) => {
    setSelectedCharges(prev =>
      prev.includes(chargeId)
        ? prev.filter(id => id !== chargeId)
        : [...prev, chargeId]
    );
  };

  const getTotalAmount = () => {
    return charges
      .filter(charge => selectedCharges.includes(charge.id))
      .reduce((total, charge) => total + (charge.amount || 0), 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="content-container">

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <table className="placeholder-header">
          <tbody>
            <tr>
              <td className="cell-left">
                <Typography variant="h1" sx={{ margin: 0 }}>
                  New Invoice
                </Typography>
              </td>
              <td className="cell-right">
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(-1)}
                  sx={{ mr: 2 }}
                >
                  Back
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Company Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h3" gutterBottom>
              Inqwise, Ltd.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              4G/9 Brener<br />
              Bat Yam 59486<br />
              Israel
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>VAT Number:</strong> 514943901
            </Typography>
          </Paper>
        </Grid>

        {/* Invoice Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h3" gutterBottom>
              Invoice Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Billing ID
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {accountId}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  Draft
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Billing Period From"
                  type="date"
                  value={billingPeriodFrom}
                  onChange={(e) => setBillingPeriodFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Billing Period To"
                  type="date"
                  value={billingPeriodTo}
                  onChange={(e) => setBillingPeriodTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Bill To */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h3" gutterBottom>
              Bill To:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Business Name (Optional)"
                  value={billingAddress.businessName || ''}
                  onChange={(e) =>
                    setBillingAddress(prev => ({ ...prev, businessName: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6} />
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name *"
                  value={billingAddress.firstName || ''}
                  onChange={(e) =>
                    setBillingAddress(prev => ({ ...prev, firstName: e.target.value }))
                  }
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name *"
                  value={billingAddress.lastName || ''}
                  onChange={(e) =>
                    setBillingAddress(prev => ({ ...prev, lastName: e.target.value }))
                  }
                  error={!!validationErrors.lastName}
                  helperText={validationErrors.lastName}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address Line 1 *"
                  value={billingAddress.address1 || ''}
                  onChange={(e) =>
                    setBillingAddress(prev => ({ ...prev, address1: e.target.value }))
                  }
                  error={!!validationErrors.address1}
                  helperText={validationErrors.address1}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address Line 2 (Optional)"
                  value={billingAddress.address2 || ''}
                  onChange={(e) =>
                    setBillingAddress(prev => ({ ...prev, address2: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="City *"
                  value={billingAddress.city || ''}
                  onChange={(e) =>
                    setBillingAddress(prev => ({ ...prev, city: e.target.value }))
                  }
                  error={!!validationErrors.city}
                  helperText={validationErrors.city}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!validationErrors.country}>
                  <InputLabel>Country *</InputLabel>
                  <Select
                    value={billingAddress.countryId || ''}
                    label="Country *"
                    onChange={(e) => handleCountryChange(parseInt(e.target.value as string))}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {validationErrors.country && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {validationErrors.country}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="ZIP Code *"
                  value={billingAddress.postalCode || ''}
                  onChange={(e) =>
                    setBillingAddress(prev => ({ ...prev, postalCode: e.target.value }))
                  }
                  error={!!validationErrors.zip}
                  helperText={validationErrors.zip || '(5 or 9 digits)'}
                  fullWidth
                  required
                />
              </Grid>
              {(showStateField || showProvinceField) && (
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!validationErrors.state}>
                    <InputLabel>{showStateField ? 'State *' : 'Province *'}</InputLabel>
                    <Select
                      value={billingAddress.stateId || ''}
                      label={showStateField ? 'State *' : 'Province *'}
                      onChange={(e) =>
                        setBillingAddress(prev => ({ ...prev, stateId: parseInt(e.target.value as string) }))
                      }
                    >
                      {states.map((state) => (
                        <MenuItem key={state.id} value={state.id}>
                          {state.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {validationErrors.state && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {validationErrors.state}
                    </Typography>
                  )}
                </Grid>
              )}
              <Grid item xs={12} md={4}>
                <TextField
                  label="Phone (Optional)"
                  value={billingAddress.phone1 || ''}
                  onChange={(e) =>
                    setBillingAddress(prev => ({ ...prev, phone1: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Available Charges */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h3" gutterBottom>
              Available Charges
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedCharges.length > 0 && selectedCharges.length < charges.length}
                        checked={charges.length > 0 && selectedCharges.length === charges.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCharges(charges.map(charge => charge.id));
                          } else {
                            setSelectedCharges([]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Charge #</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {charges.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedCharges.includes(charge.id)}
                          onChange={() => handleChargeSelection(charge.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {charge.chargeDate ? new Date(charge.chargeDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{charge.name || 'N/A'}</TableCell>
                      <TableCell>{charge.description || 'N/A'}</TableCell>
                      <TableCell align="right">{charge.chargeId || 'N/A'}</TableCell>
                      <TableCell align="right">${(charge.amount || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {charges.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">
                          No uninvoiced charges found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="h4">
                Total Charges: ${getTotalAmount().toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h3" gutterBottom>
              Notes:
            </Typography>
            <TextField
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              fullWidth
              sx={{ mb: 3 }}
            />

            {/* Action Buttons */}
            <Box display="flex" gap={2}>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                color="primary"
                onClick={handleSaveAsDraft}
                disabled={saving}
              >
                Save as Draft
              </Button>
              <Button
                startIcon={<SendIcon />}
                variant="contained"
                color="success"
                onClick={handleOpenInvoice}
                disabled={saving}
              >
                Open
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateInvoicePage;
