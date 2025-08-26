import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  CircularProgress,
  Link as MUILink,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import opinionApiService from '../../services';
import { ROUTES } from '../../constants';

interface Invoice {
  invoiceId: number;
  invoiceDate: string;
  fromDate: string;
  toDate: string;
  statusId: number;
  amount: number;
  accountId: number;
}

interface InvoicesTabProps {
  accountId: number;
}

const InvoicesTab: React.FC<InvoicesTabProps> = ({ accountId }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Sort state
  const [orderBy, setOrderBy] = useState<keyof Invoice>('invoiceId');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all invoices (no status filter)
      const response = await opinionApiService.getInvoices(accountId);
      
      if (response.success && response.data?.list) {
        setInvoices(response.data.list);
      } else {
        setError('Failed to load invoices');
      }
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err);
      setError(err?.message || 'An error occurred while loading invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [accountId]);

  // Get invoice status text
  const getInvoiceStatus = (statusId: number): string => {
    switch (statusId) {
      case 1:
        return 'Draft';
      case 2:
        return 'Open';
      default:
        return 'Unknown';
    }
  };

  // Format billing period
  const formatBillingPeriod = (fromDate: string, toDate: string): string => {
    return `${fromDate} - ${toDate}`;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  // Handle sort
  const handleSort = (property: keyof Invoice) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort invoices
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (orderBy === 'amount') {
      return order === 'asc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    }
    
    if (orderBy === 'invoiceDate' || orderBy === 'fromDate') {
      const aDate = new Date(a[orderBy]).getTime();
      const bDate = new Date(b[orderBy]).getTime();
      return order === 'asc' ? aDate - bDate : bDate - aDate;
    }
    
    if (a[orderBy] < b[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Handle selection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedInvoices(invoices.map(invoice => invoice.invoiceId));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId: number) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  const isSelected = (invoiceId: number) => selectedInvoices.includes(invoiceId);
  const isAllSelected = invoices.length > 0 && selectedInvoices.length === invoices.length;
  const isPartiallySelected = selectedInvoices.length > 0 && selectedInvoices.length < invoices.length;

  // Handle create invoice
  const handleCreateInvoice = () => {
    // Navigate to create invoice page
    navigate(`${ROUTES.CREATE_INVOICE}?account_id=${accountId}`);
  };

  // Handle delete invoices
  const handleDeleteInvoices = async () => {
    if (selectedInvoices.length === 0) return;
    
    try {
      setLoading(true);
      const response = await opinionApiService.deleteInvoices(selectedInvoices);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: `Successfully deleted ${selectedInvoices.length} invoice(s)`,
          severity: 'success'
        });
        setSelectedInvoices([]);
        // Refresh the invoices list
        await fetchInvoices();
      } else {
        throw new Error('Failed to delete invoices');
      }
    } catch (err: any) {
      console.error('Failed to delete invoices:', err);
      setSnackbar({
        open: true,
        message: err?.message || 'Failed to delete invoices',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && invoices.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateInvoice}
          disabled={loading}
        >
          Create Invoice
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
          disabled={selectedInvoices.length === 0 || loading}
        >
          Delete
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Invoices Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isPartiallySelected}
                  onChange={handleSelectAll}
                  disabled={invoices.length === 0}
                />
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'invoiceId'}
                  direction={orderBy === 'invoiceId' ? order : 'asc'}
                  onClick={() => handleSort('invoiceId')}
                >
                  #
                </TableSortLabel>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'invoiceDate'}
                  direction={orderBy === 'invoiceDate' ? order : 'asc'}
                  onClick={() => handleSort('invoiceDate')}
                >
                  Invoice Date
                </TableSortLabel>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'fromDate'}
                  direction={orderBy === 'fromDate' ? order : 'asc'}
                  onClick={() => handleSort('fromDate')}
                >
                  Billing Period
                </TableSortLabel>
              </TableCell>
              
              <TableCell>Invoice</TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'statusId'}
                  direction={orderBy === 'statusId' ? order : 'asc'}
                  onClick={() => handleSort('statusId')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'amount'}
                  direction={orderBy === 'amount' ? order : 'asc'}
                  onClick={() => handleSort('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {sortedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No records found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedInvoices.map((invoice) => (
                <TableRow
                  key={invoice.invoiceId}
                  selected={isSelected(invoice.invoiceId)}
                  hover
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(invoice.invoiceId)}
                      onChange={() => handleSelectInvoice(invoice.invoiceId)}
                    />
                  </TableCell>
                  
                  <TableCell align="right">
                    {invoice.invoiceId}
                  </TableCell>
                  
                  <TableCell>
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </TableCell>
                  
                  <TableCell>
                    {formatBillingPeriod(
                      new Date(invoice.fromDate).toLocaleDateString(),
                      new Date(invoice.toDate).toLocaleDateString()
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <MUILink
                      component="button"
                      variant="body2"
                      onClick={() => {
                        // Navigate to invoice details page
                        const invoiceDetailsPath = ROUTES.INVOICE_DETAILS.replace(':id', invoice.invoiceId.toString());
                        navigate(invoiceDetailsPath);
                      }}
                    >
                      Invoice #{invoice.invoiceId}
                    </MUILink>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getInvoiceStatus(invoice.statusId)}
                      color={invoice.statusId === 1 ? 'warning' : 'success'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="right">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedInvoices.length} selected invoice(s)? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteInvoices} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoicesTab;
