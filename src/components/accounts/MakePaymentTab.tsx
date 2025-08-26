import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { CreditCard, Payment as PaymentIcon } from '@mui/icons-material';
import { opinionApiService as apiService } from '../../services';
import { countries } from '../../data/countries';

interface MakePaymentTabProps {
  accountId: number;
}

interface PaymentFormData {
  // Amount section
  amount: string;
  
  // Credit card details
  creditCardTypeId: number;
  creditCardNumber: string;
  expDateMonth: number;
  expDateYear: number;
  cvv2Number: string;
  firstName: string;
  lastName: string;
  
  // Billing information
  address1: string;
  address2: string;
  city: string;
  countryId: number;
  stateId: number | string;
  postalCode: string;
}

interface PaymentStep {
  step: 'form' | 'review' | 'success';
}

export const MakePaymentTab: React.FC<MakePaymentTabProps> = ({ accountId }) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<PaymentStep['step']>('form');
  
  // Account and payment data
  const [userId, setUserId] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [charges, setCharges] = useState<any[]>([]);
  const [amountDue, setAmountDue] = useState<number>(0);
  const [amountToFund, setAmountToFund] = useState<number>(0);
  const [isFundMode, setIsFundMode] = useState<boolean>(true); // true for custom amount, false for paying charges
  const [hasBusinessAddress, setHasBusinessAddress] = useState<boolean>(false);
  
  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Payment form data
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: '',
    creditCardTypeId: 1, // Default to Visa
    creditCardNumber: '',
    expDateMonth: new Date().getMonth() + 1,
    expDateYear: new Date().getFullYear(),
    cvv2Number: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    countryId: 232, // Default to United States
    stateId: '',
    postalCode: ''
  });
  
  // Load initial data
  useEffect(() => {
    loadPaymentData();
  }, [accountId]);
  
  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get account details for balance and owner info
      const accountResponse = await apiService.getAccount(accountId);
      if (accountResponse.success) {
        const accountData = accountResponse.data;
        // Balance property might not be available in all Account types
        // This would typically come from a separate billing/payment API call
        setBalance(0); // TODO: Get balance from appropriate API endpoint
        setUserId(accountData.ownerId);
        
        // Try to get payment details if we have a user ID
        if (accountData.ownerId) {
          try {
            const paymentResponse = await apiService.getPaymentDetails(accountData.ownerId, accountId);
            if (paymentResponse.success) {
              const paymentData = paymentResponse.data;
              setHasBusinessAddress(paymentData.hasBusinessAddress || false);
              
              // Pre-fill form with existing business address
              setFormData(prev => ({
                ...prev,
                firstName: paymentData.firstName || '',
                lastName: paymentData.lastName || '',
                address1: paymentData.address1 || '',
                address2: paymentData.address2 || '',
                city: paymentData.city || '',
                countryId: paymentData.countryId || 232,
                stateId: paymentData.stateId || '',
                postalCode: paymentData.postalCode || ''
              }));
            }
          } catch (paymentErr) {
            console.warn('Could not load payment details:', paymentErr);
          }
        }
        
        // Check for any unpaid charges (this would come from URL params in real implementation)
        const chargeIds: number[] = []; // In reality, this would come from URL params
        if (chargeIds.length > 0) {
          const chargesResponse = await apiService.getCharges(accountId, chargeIds, 1); // statusId 1 = unpaid
          if (chargesResponse.success) {
            const chargesData = chargesResponse.data;
            setCharges(chargesData.list || []);
            setAmountDue(chargesData.amountDue || 0);
            setAmountToFund(chargesData.amountToFund || 0);
            setIsFundMode(chargesData.list.length === 0);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Amount validation (only for fund mode)
    if (isFundMode) {
      if (!formData.amount) {
        errors.amount = 'This field is required.';
      } else {
        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
          errors.amount = 'Please enter a valid currency value.';
        } else if (amount < 0.01) {
          errors.amount = 'Please enter a value greater than or equal to 0.01.';
        }
      }
    }
    
    // Credit card validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'This field is required.';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'This field is required.';
    }
    
    if (!formData.creditCardNumber.trim()) {
      errors.creditCardNumber = 'This field is required.';
    } else if (formData.creditCardNumber.length < 15) {
      errors.creditCardNumber = 'Please enter a valid credit card number.';
    }
    
    if (!formData.cvv2Number.trim()) {
      errors.cvv2Number = 'This field is required.';
    } else if (formData.cvv2Number.length < 3) {
      errors.cvv2Number = 'CVV must be at least 3 digits.';
    }
    
    // Billing address validation
    if (!formData.address1.trim()) {
      errors.address1 = 'This field is required.';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'This field is required.';
    }
    
    if (!formData.countryId) {
      errors.countryId = 'This field is required.';
    }
    
    // State validation for US and Canada
    if (formData.countryId === 232 || formData.countryId === 39) { // US or Canada
      if (!formData.stateId) {
        errors.stateId = 'This field is required.';
      }
    }
    
    if (!formData.postalCode.trim()) {
      errors.postalCode = 'This field is required.';
    } else if (formData.postalCode.length < 5 || formData.postalCode.length > 9) {
      errors.postalCode = 'Please enter a valid postal code (5 or 9 digits).';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmitPayment = () => {
    if (!validateForm()) {
      setError('Please correct the errors below');
      return;
    }
    
    setCurrentStep('review');
  };
  
  const handleConfirmPayment = async () => {
    if (!userId) {
      setError('User information not available');
      return;
    }
    
    try {
      setProcessing(true);
      setError(null);
      
      const paymentAmount = isFundMode ? parseFloat(formData.amount) : amountToFund;
      const selectedCountry = countries.find(c => c.id === formData.countryId);
      
      const paymentData = {
        userId,
        accountId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        creditCardTypeId: formData.creditCardTypeId,
        creditCardNumber: formData.creditCardNumber.trim(),
        expDateMonth: formData.expDateMonth,
        expDateYear: formData.expDateYear,
        cvv2Number: formData.cvv2Number.trim(),
        address1: formData.address1.trim(),
        address2: formData.address2.trim(),
        city: formData.city.trim(),
        countryCode: selectedCountry?.code || 'US',
        countryId: formData.countryId,
        stateId: formData.stateId,
        postalCode: formData.postalCode.trim(),
        amount: paymentAmount,
        charges: charges.map(c => c.chargeId),
        isAddressChanged: !hasBusinessAddress
      };
      
      const response = await apiService.directPayment(paymentData);
      
      if (response.success) {
        setCurrentStep('success');
      } else {
        throw new Error(response.error?.message || 'Payment failed');
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };
  
  const getCreditCardTypeName = (typeId: number): string => {
    switch (typeId) {
      case 1: return 'Visa';
      case 2: return 'MasterCard';
      case 3: return 'Discover';
      case 4: return 'American Express';
      default: return 'Credit Card';
    }
  };
  
  const generateExpirationYears = (): number[] => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 19; i++) {
      years.push(currentYear + i);
    }
    return years;
  };
  
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
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
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Left Content */}
        <Grid item xs={12} md={8}>
          {currentStep === 'form' && (
            <Box>
              {/* Specify Payment Amount */}
              {isFundMode && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Specify your payment amount
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        label="Amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        error={!!validationErrors.amount}
                        helperText={validationErrors.amount}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                        }}
                        inputProps={{ min: 0.01, step: 0.01, max: 10000 }}
                        sx={{ maxWidth: 200 }}
                        required
                      />
                    </Box>
                  </CardContent>
                </Card>
              )}
              
              {/* Credit Card Details */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Credit Card Details
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Card Type</InputLabel>
                        <Select
                          value={formData.creditCardTypeId}
                          onChange={(e) => setFormData(prev => ({ ...prev, creditCardTypeId: Number(e.target.value) }))}
                          label="Card Type"
                        >
                          <MenuItem value={1}>Visa</MenuItem>
                          <MenuItem value={2}>MasterCard</MenuItem>
                          <MenuItem value={3}>Discover</MenuItem>
                          <MenuItem value={4}>American Express</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Card Number"
                        value={formData.creditCardNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, creditCardNumber: e.target.value }))}
                        error={!!validationErrors.creditCardNumber}
                        helperText={validationErrors.creditCardNumber}
                        inputProps={{ maxLength: 19 }}
                        required
                      />
                      {/* Credit card icons could go here */}
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <FormControl fullWidth required>
                        <InputLabel>Exp Month</InputLabel>
                        <Select
                          value={formData.expDateMonth}
                          onChange={(e) => setFormData(prev => ({ ...prev, expDateMonth: Number(e.target.value) }))}
                          label="Exp Month"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <MenuItem key={i + 1} value={i + 1}>
                              {String(i + 1).padStart(2, '0')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <FormControl fullWidth required>
                        <InputLabel>Exp Year</InputLabel>
                        <Select
                          value={formData.expDateYear}
                          onChange={(e) => setFormData(prev => ({ ...prev, expDateYear: Number(e.target.value) }))}
                          label="Exp Year"
                        >
                          {generateExpirationYears().map(year => (
                            <MenuItem key={year} value={year}>{year}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="CVV2/CSC"
                        value={formData.cvv2Number}
                        onChange={(e) => setFormData(prev => ({ ...prev, cvv2Number: e.target.value }))}
                        error={!!validationErrors.cvv2Number}
                        helperText={validationErrors.cvv2Number || '(On the back of your card, locate the final 3 or 4 digit number)'}
                        inputProps={{ maxLength: 4 }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        error={!!validationErrors.firstName}
                        helperText={validationErrors.firstName || '(as it appears on card)'}
                        inputProps={{ maxLength: 32 }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        error={!!validationErrors.lastName}
                        helperText={validationErrors.lastName || '(as it appears on card)'}
                        inputProps={{ maxLength: 32 }}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              {/* Billing Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Billing Information
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address Line 1"
                        value={formData.address1}
                        onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
                        error={!!validationErrors.address1}
                        helperText={validationErrors.address1}
                        inputProps={{ maxLength: 100 }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address Line 2 (Optional)"
                        value={formData.address2}
                        onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
                        inputProps={{ maxLength: 100 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        error={!!validationErrors.city}
                        helperText={validationErrors.city}
                        inputProps={{ maxLength: 40 }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ZIP Code"
                        value={formData.postalCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                        error={!!validationErrors.postalCode}
                        helperText={validationErrors.postalCode || '(5 or 9 digits)'}
                        inputProps={{ maxLength: 10 }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required error={!!validationErrors.countryId}>
                        <InputLabel>Country</InputLabel>
                        <Select
                          value={formData.countryId}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            countryId: Number(e.target.value),
                            stateId: '' // Reset state when country changes
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
                      {(formData.countryId === 232 || formData.countryId === 39) && (
                        <TextField
                          fullWidth
                          label={formData.countryId === 232 ? "State" : "Province"}
                          value={formData.stateId}
                          onChange={(e) => setFormData(prev => ({ ...prev, stateId: e.target.value }))}
                          error={!!validationErrors.stateId}
                          helperText={validationErrors.stateId}
                          required
                          placeholder={formData.countryId === 232 ? "Select state..." : "Select province..."}
                        />
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              {/* Submit Button */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PaymentIcon />}
                  onClick={handleSubmitPayment}
                  disabled={processing}
                >
                  Submit Payment
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
          
          {currentStep === 'review' && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Review your payment
              </Typography>
              <Typography sx={{ mb: 3 }}>
                Please confirm that you would like to make the following payment:
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment details
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Pay using:</strong> {getCreditCardTypeName(formData.creditCardTypeId)} ****{formData.creditCardNumber.slice(-4)}
                    </Typography>
                    <Typography>
                      <strong>Payment amount:</strong> {formatCurrency(isFundMode ? parseFloat(formData.amount) : amountToFund)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                  onClick={handleConfirmPayment}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Make payment of ${formatCurrency(isFundMode ? parseFloat(formData.amount) : amountToFund)}`}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setCurrentStep('form')}
                  disabled={processing}
                >
                  Back
                </Button>
              </Box>
            </Box>
          )}
          
          {currentStep === 'success' && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Payment confirmation
              </Typography>
              <Typography sx={{ mb: 3 }}>
                Thank you for your payment of <strong>{formatCurrency(isFundMode ? parseFloat(formData.amount) : amountToFund)}</strong>.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.href = `/accounts/${accountId}?tab=transactions`}
              >
                View Transaction History
              </Button>
            </Box>
          )}
        </Grid>
        
        {/* Right Content - Payment Summary */}
        <Grid item xs={12} md={4}>
          {!isFundMode && charges.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Details
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {charges.map((charge) => (
                        <TableRow key={charge.chargeId}>
                          <TableCell>
                            <Typography variant="body2">
                              {charge.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(charge.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell>
                          <Typography variant="body2">
                            <strong>Total:</strong>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            <strong>{formatCurrency(amountDue)}</strong>
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body2">
                            <strong>Current Balance:</strong>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main">
                            <strong>{formatCurrency(balance)}</strong>
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body2">
                            <strong>Amount to Pay:</strong>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            <strong>{formatCurrency(amountToFund)}</strong>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default MakePaymentTab;
