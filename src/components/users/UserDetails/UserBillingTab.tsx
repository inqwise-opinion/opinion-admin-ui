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
  Chip,
  Button,
  Link,
} from '@mui/material';
import { format } from 'date-fns';
import { Download } from '@mui/icons-material';
import { opinionApiService } from '../../../services';

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  downloadUrl?: string;
}

interface BillingInfo {
  planName: string;
  planPrice: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  status: string;
}

interface UserBillingTabProps {
  userId: string;
}

const UserBillingTab: React.FC<UserBillingTabProps> = ({ userId }) => {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, [userId]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const billingResponse = await opinionApiService.getUserBilling(parseInt(userId));
      if (billingResponse.success) {
        setBillingInfo(billingResponse.data.currentPlan);
        setInvoices(billingResponse.data.invoices || []);
      }
    } catch (err: any) {
      console.error('Failed to load billing data:', err);
      setError(err.message || 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      if (invoice.downloadUrl) {
        window.open(invoice.downloadUrl, '_blank');
      } else {
        // TODO: Implement downloadInvoice API method
        console.log('Download invoice:', invoice.id);
        alert('Download functionality not implemented yet');
      }
    } catch (err: any) {
      console.error('Failed to download invoice:', err);
    }
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
        Billing Information
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Plan Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Plan
            </Typography>
            {billingInfo ? (
              <Box>
                <Box display="flex" mb={1}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Plan:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {billingInfo.planName}
                  </Typography>
                </Box>
                <Box display="flex" mb={1}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Price:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {formatCurrency(billingInfo.planPrice, billingInfo.currency)} / {billingInfo.billingCycle}
                  </Typography>
                </Box>
                <Box display="flex" mb={1}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Next Billing:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {formatDate(billingInfo.nextBillingDate)}
                  </Typography>
                </Box>
                <Box display="flex" mb={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Status:
                  </Typography>
                  <Chip 
                    label={billingInfo.status}
                    size="small"
                    color={getStatusColor(billingInfo.status)}
                    sx={{ ml: 1 }}
                  />
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No billing information available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Invoices */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Invoices
          </Typography>
          {invoices.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No invoices found for this user.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {invoice.number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(invoice.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status}
                          size="small"
                          color={getStatusColor(invoice.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<Download />}
                          onClick={() => handleDownloadInvoice(invoice)}
                          disabled={invoice.status === 'cancelled'}
                        >
                          Download
                        </Button>
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

export default UserBillingTab;
