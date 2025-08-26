import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Link as MUILink,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import opinionApiService from '../../services';
import { ROUTES } from '../../constants';
import { useSetBreadcrumbs } from '../../contexts/BreadcrumbContext';

interface InvoiceDetails {
  id?: string;
  invoiceId?: number;
  accountId?: number;
  number?: string;
  status?: string;
  statusId?: number;
  amount?: number;
  currency?: string;
  issueDate?: string;
  invoiceDate?: string;
  dueDate?: string;
  paidDate?: string;
  fromDate?: string;
  toDate?: string;
  billingId?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  countryId?: number;
  stateId?: number;
  postalCode?: string;
  phone1?: string;
  notes?: string;
  charges?: {
    list: InvoiceCharge[];
  };
  transactions?: {
    list: InvoiceTransaction[];
    totalCredit: number;
  };
}

interface InvoiceCharge {
  chargeId: number;
  chargeDate: string;
  name: string;
  description?: string;
  amount: number;
}

interface InvoiceTransaction {
  transactionId: number;
  modifyDate: string;
  typeId: number;
  amount: number;
  creditCardTypeId?: number;
  creditCard?: string;
}

interface AccountDetails {
  accountId: number;
  accountName: string;
}

const InvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs, clearBreadcrumbs } = useSetBreadcrumbs();
  
  // State
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadInvoiceDetails();
    }
  }, [id]);

  // Cleanup breadcrumbs on unmount
  useEffect(() => {
    return () => {
      clearBreadcrumbs();
    };
  }, [clearBreadcrumbs]);

  const loadInvoiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error('Invoice ID is required');
      }

      // Mock account ID - in real implementation, this should come from URL params or context
      const mockAccountId = 1;

      // Load account details first
      const accountResponse = await opinionApiService.getAccountDetails(mockAccountId);
      if (accountResponse.success && accountResponse.data) {
        setAccount(accountResponse.data);
        
        // Set custom breadcrumbs to hide MainLayout's "Home" breadcrumb
        setBreadcrumbs([
          {
            label: 'Accounts',
            onClick: () => navigate(ROUTES.ACCOUNTS)
          },
          {
            label: accountResponse.data.accountName,
            onClick: () => navigate(`/accounts/${mockAccountId}`)
          },
          {
            label: 'Invoices',
            onClick: () => {
              const searchParams = new URLSearchParams({ tab: 'invoices' });
              navigate(`/accounts/${mockAccountId}?${searchParams.toString()}`);
            }
          },
          {
            label: `Invoice #${id}`
          }
        ]);
      }

      // Load invoice details
      const invoiceResponse = await opinionApiService.getInvoiceDetails(mockAccountId, parseInt(id));
      if (invoiceResponse.success && invoiceResponse.data) {
        setInvoice(invoiceResponse.data);
      } else {
        throw new Error('Failed to load invoice details');
      }
    } catch (err) {
      console.error('Error loading invoice details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };


  const getInvoiceStatus = (statusId?: number): string => {
    switch (statusId) {
      case 1:
        return 'Draft';
      case 2:
        return 'Open';
      default:
        return 'Unknown';
    }
  };

  const getTransactionType = (typeId: number): string => {
    switch (typeId) {
      case 2:
        return 'Payment';
      default:
        return typeId.toString();
    }
  };

  const getCreditCardType = (creditCardTypeId?: number): string => {
    switch (creditCardTypeId) {
      case 1:
        return 'Visa';
      case 2:
        return 'MasterCard';
      case 3:
        return 'Discover';
      case 4:
        return 'American Express';
      default:
        return '';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice || !account) {
    return (
      <Box>
        <Alert severity="error">Invoice not found</Alert>
      </Box>
    );
  }

  const currentInvoice = invoice;

  return (
    <Box className="content-container">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <table className="placeholder-header" style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td className="cell-left">
                <Typography variant="h1" sx={{ margin: 0 }}>
                  Invoice #{currentInvoice.invoiceId || currentInvoice.id || id}
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

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Column */}
        <Box className="wrapper-content-left" sx={{ flex: 1 }}>
          {/* Company Info */}
          <Box sx={{ pt: 1.5 }}>
            <Typography variant="body2">
              Inqwise, Ltd.<br />
              4G/9 Brener<br />
              Bat Yam 59486<br />
              Israel
            </Typography>
          </Box>

          <Box sx={{ pt: 1.5 }}>
            <Typography variant="body2">
              <strong>VAT Number</strong> 514943901
            </Typography>
          </Box>

          {/* Invoice Details */}
          <Box sx={{ pb: 2.5 }}>
            <Typography variant="h3" className="ui-header-light" sx={{ mb: 1.5 }}>
              Invoice Details
            </Typography>
            
            <Box sx={{ pt: 1.5 }}>
              <Box className="params" sx={{ display: 'flex', mb: 1 }}>
                <Box className="param-name" sx={{ minWidth: 120 }}>Invoice Id:</Box>
                <Box className="param-value">
                  <Typography sx={{ fontWeight: 'bold', color: '#000' }}>
                    {currentInvoice.invoiceId || currentInvoice.id || id}
                  </Typography>
                </Box>
              </Box>

              <Box className="params" sx={{ display: 'flex', mb: 1 }}>
                <Box className="param-name" sx={{ minWidth: 120 }}>Invoice Date:</Box>
                <Box className="param-value">
                  <Typography sx={{ fontWeight: 'bold', color: '#000' }}>
                    {currentInvoice.invoiceDate ? new Date(currentInvoice.invoiceDate).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'short', day: 'numeric' 
                    }) : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Billing Period - View Mode */}
              <Box className="params" sx={{ display: 'flex', mb: 1 }}>
                <Box className="param-name" sx={{ minWidth: 120 }}>Billing Period:</Box>
                <Box className="param-value">
                  <Typography sx={{ fontWeight: 'bold', color: '#000' }}>
                    {currentInvoice.fromDate && currentInvoice.toDate ? 
                      `${new Date(currentInvoice.fromDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} - ${new Date(currentInvoice.toDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}` 
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Box className="params" sx={{ display: 'flex', mb: 1 }}>
                <Box className="param-name" sx={{ minWidth: 120 }}>Billing Id:</Box>
                <Box className="param-value">
                  <Typography sx={{ fontWeight: 'bold', color: '#000' }}>
                    {account.accountId}
                  </Typography>
                </Box>
              </Box>

              <Box className="params" sx={{ display: 'flex', mb: 1 }}>
                <Box className="param-name" sx={{ minWidth: 120 }}>Status:</Box>
                <Box className="param-value">
                  <Typography sx={{ fontWeight: 'bold', color: '#000' }}>
                    {getInvoiceStatus(currentInvoice.statusId)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Bill To Section - View Mode Only */}
          <Box sx={{ pb: 2.5 }}>
            <Typography variant="h3" className="ui-header-light" sx={{ mb: 1.5 }}>
              Bill To:
            </Typography>
            <Box sx={{ pt: 1.5 }}>
              {currentInvoice.companyName && (
                <>
                  {currentInvoice.companyName}<br />
                </>
              )}
              {currentInvoice.firstName} {currentInvoice.lastName}<br />
              {currentInvoice.address1}<br />
              {currentInvoice.address2 && (
                <>
                  {currentInvoice.address2}<br />
                </>
              )}
              {currentInvoice.city}{currentInvoice.stateId ? `, ${currentInvoice.stateId}` : ''}<br />
              {currentInvoice.postalCode}<br />
              {currentInvoice.countryId}<br />
              {currentInvoice.phone1}
            </Box>
          </Box>

          {/* Charges Section */}
          <Box sx={{ clear: 'both' }}>
            <Typography variant="h3" className="ui-header-light" sx={{ mb: 1.5 }}>
              Charges
            </Typography>
            <Box sx={{ pt: 1.5 }}>
              <TableContainer>
                <Table className="ti">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Charge #</TableCell>
                      <TableCell align="right" sx={{ width: 74 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentInvoice.charges?.list && currentInvoice.charges.list.length > 0 ? (
                      currentInvoice.charges.list.map((charge) => (
                        <TableRow key={charge.chargeId}>
                          <TableCell>{charge.chargeDate}</TableCell>
                          <TableCell>{charge.name}</TableCell>
                          <TableCell>{charge.description || ''}</TableCell>
                          <TableCell>{charge.chargeId}</TableCell>
                          <TableCell align="right">{formatCurrency(charge.amount)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="nop">
                        <TableCell colSpan={5}>
                          <Typography sx={{ fontWeight: 'bold' }}>No records found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <tfoot>
                    <TableRow>
                      <TableCell colSpan={4} align="right">&nbsp;</TableCell>
                      <TableCell align="right" className="cell-sub-total">&nbsp;</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} align="right" className="label-total">
                        <Typography sx={{ fontWeight: 'bold' }}>Total Charges:</Typography>
                      </TableCell>
                      <TableCell align="right" className="cell-total">
                        {formatCurrency(currentInvoice.amount || 0)}
                      </TableCell>
                    </TableRow>
                  </tfoot>
                </Table>
              </TableContainer>

            </Box>
          </Box>

          {/* Payments Section */}
          <Box sx={{ clear: 'both', pt: 3 }}>
            <Typography variant="h3" className="ui-header-light" sx={{ mb: 1.5 }}>
              Payments
            </Typography>
            <Box sx={{ pt: 1.5 }}>
              <TableContainer>
                <Table className="ti">
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction Date</TableCell>
                      <TableCell>Transaction Id</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right" sx={{ width: 74 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentInvoice.transactions?.list && currentInvoice.transactions.list.length > 0 ? (
                      currentInvoice.transactions.list.map((transaction) => (
                        <TableRow key={transaction.transactionId}>
                          <TableCell>{transaction.modifyDate}</TableCell>
                          <TableCell>{transaction.transactionId}</TableCell>
                          <TableCell>
                            {getTransactionType(transaction.typeId)}: {transaction.creditCard ? 
                              `${getCreditCardType(transaction.creditCardTypeId)} ****${transaction.creditCard}` : ''}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(transaction.amount)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="nop">
                        <TableCell colSpan={4}>
                          <Typography sx={{ fontWeight: 'bold' }}>No records found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <tfoot>
                    <TableRow>
                      <TableCell colSpan={3} align="right">&nbsp;</TableCell>
                      <TableCell align="right" className="cell-sub-total">&nbsp;</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} align="right" className="label-total">
                        <Typography sx={{ fontWeight: 'bold' }}>Total:</Typography>
                      </TableCell>
                      <TableCell align="right" className="cell-total">
                        {formatCurrency(currentInvoice.transactions?.totalCredit || 0)}
                      </TableCell>
                    </TableRow>
                  </tfoot>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          {/* Notes Section - View Mode Only */}
          <Box sx={{ clear: 'both', pt: 6 }}>
            <Typography variant="body2">
              * May include estimated US sales tax, VAT and GST<br />
              ** This is not a VAT invoice<br />
              All charges and prices are in US Dollars<br /><br />
              All services are sold by Inqwise, Ltd.<br />
              The above charges include charges incurred by your account as well as by all accounts you are responsible for through Consolidated Billing.<br /><br />
              Thank you for using Inqwise.<br />
              Sincerely,<br />
              The Inqwise Team
            </Typography>
          </Box>
        </Box>
      </Box>

    </Box>
  );
};

export default InvoiceDetailsPage;
