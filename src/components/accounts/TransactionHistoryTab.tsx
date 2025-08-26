import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Collapse,
  TextField,
  IconButton,
  Divider,
  TableSortLabel,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MoreVert as MoreVertIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as SwapHorizIcon,
  CardGiftcard as CardGiftcardIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { opinionApiService as apiService } from '../../services';

interface TransactionHistoryTabProps {
  accountId: number;
}

interface Transaction {
  transactionId: number;
  typeId: number;
  accountId: number;
  amount: number;
  debit?: number;
  credit?: number;
  balance: number;
  comments?: string;
  referenceId?: number;
  chargeDescription?: string;
  creditCard?: string;
  creditCardTypeId?: number;
  modifyDate: string;
  insertDate: string;
}

interface TransactionGroup {
  fromDate: string;
  toDate: string;
  transactions: Transaction[];
  debit: number;
  credit: number;
  balance: number;
  invoices?: any[];
}

interface TransactionFormData {
  amount: string;
  comments: string;
}

export const TransactionHistoryTab: React.FC<TransactionHistoryTabProps> = ({ accountId }) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data state
  const [balance, setBalance] = useState<number>(0);
  const [lastFundTransaction, setLastFundTransaction] = useState<any>(null);
  const [transactionGroups, setTransactionGroups] = useState<TransactionGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<TransactionGroup[]>([]);

  // UI state
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filterValue, setFilterValue] = useState<string>('');
  const [moreActionsAnchor, setMoreActionsAnchor] = useState<null | HTMLElement>(null);

  // Form states
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showDebitForm, setShowDebitForm] = useState(false);
  const [showManualTransactionForm, setShowManualTransactionForm] = useState(false);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [manualTransactionType, setManualTransactionType] = useState<'payment' | 'refund'>('payment');
  
  // Form data
  const [creditForm, setCreditForm] = useState<TransactionFormData>({ amount: '', comments: '' });
  const [debitForm, setDebitForm] = useState<TransactionFormData>({ amount: '', comments: '' });
  const [paymentForm, setPaymentForm] = useState<TransactionFormData>({ amount: '', comments: '' });
  const [refundForm, setRefundForm] = useState<TransactionFormData>({ amount: '', comments: '' });
  const [promotionCode, setPromotionCode] = useState<string>('');

  // Load data on component mount
  useEffect(() => {
    loadTransactionData();
  }, [accountId]);

  const loadTransactionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load account balance and details
      const accountResponse = await apiService.getAccountDetails(accountId);
      if (accountResponse.success) {
        setBalance(accountResponse.data.balance || 0);
        setLastFundTransaction(accountResponse.data.lastFundTransaction);
      }

      // Load transactions
      const transactionsResponse = await apiService.getTransactions(accountId, {
        groupBy: 'month'
      });

      if (transactionsResponse.success) {
        const groups = transactionsResponse.data.list || [];
        setTransactionGroups(groups);
        setFilteredGroups(groups);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    
    if (!value) {
      setFilteredGroups(transactionGroups);
      return;
    }

    // Filter transactions by type
    const typeId = parseInt(value);
    const filtered = transactionGroups.map(group => ({
      ...group,
      transactions: group.transactions.filter(t => t.typeId === typeId)
    })).filter(group => group.transactions.length > 0);
    
    setFilteredGroups(filtered);
  };

  const toggleGroupExpansion = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const getCreditCardType = (typeId?: number): string => {
    switch (typeId) {
      case 1: return 'Visa';
      case 2: return 'MasterCard';
      case 3: return 'Discover';
      case 4: return 'American Express';
      default: return 'Card';
    }
  };

  const getTransactionDescription = (transaction: Transaction): string => {
    switch (transaction.typeId) {
      case 1:
        return 'Starting balance';
      case 2:
        return `Payment: ${transaction.creditCard ? 
          getCreditCardType(transaction.creditCardTypeId) + ' ****' + transaction.creditCard : 
          'PayPal'}`;
      case 3:
        return transaction.chargeDescription ? 
          `Charge: ${transaction.chargeDescription}` : 
          'Charge';
      case 4:
        return `Credit - ${transaction.comments || 'Account credit'}`;
      case 5:
        return `Debit - ${transaction.comments || 'Account debit'}`;
      case 6:
        return `Refund $${(transaction.credit || 0).toFixed(2)} - ${transaction.comments || 'Refund'}`;
      case 7:
        return `Charge canceled: Charge #${transaction.referenceId}`;
      case 9:
        return 'Promotion code applied';
      case 10:
        return 'Activation fee';
      default:
        return `Transaction #${transaction.transactionId}`;
    }
  };

  const formatCurrency = (amount?: number): string => {
    return amount ? `$${amount.toFixed(2)}` : '';
  };

  const handleCreditSubmit = async () => {
    if (!creditForm.amount || !creditForm.comments) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await apiService.credit(accountId, parseFloat(creditForm.amount), creditForm.comments);
      setSuccess('Credit added successfully');
      setShowCreditForm(false);
      setCreditForm({ amount: '', comments: '' });
      await loadTransactionData();
    } catch (err: any) {
      setError(err.message || 'Failed to add credit');
    } finally {
      setSaving(false);
    }
  };

  const handleDebitSubmit = async () => {
    if (!debitForm.amount || !debitForm.comments) {
      setError('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(debitForm.amount);
    if (amount > balance) {
      setError(`Amount cannot exceed current balance of ${formatCurrency(balance)}`);
      return;
    }

    try {
      setSaving(true);
      await apiService.debit(accountId, amount, debitForm.comments);
      setSuccess('Debit processed successfully');
      setShowDebitForm(false);
      setDebitForm({ amount: '', comments: '' });
      await loadTransactionData();
    } catch (err: any) {
      setError(err.message || 'Failed to process debit');
    } finally {
      setSaving(false);
    }
  };

  const handleManualTransactionSubmit = async () => {
    const form = manualTransactionType === 'payment' ? paymentForm : refundForm;
    
    if (!form.amount || !form.comments) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const amount = parseFloat(form.amount);
      
      if (manualTransactionType === 'payment') {
        await apiService.manualPayment(accountId, amount, form.comments);
        setSuccess('Manual payment processed successfully');
        setPaymentForm({ amount: '', comments: '' });
      } else {
        await apiService.manualRefund(accountId, amount, form.comments);
        setSuccess('Manual refund processed successfully');
        setRefundForm({ amount: '', comments: '' });
      }
      
      setShowManualTransactionForm(false);
      await loadTransactionData();
    } catch (err: any) {
      setError(err.message || 'Failed to process manual transaction');
    } finally {
      setSaving(false);
    }
  };

  const closeAllForms = () => {
    setShowCreditForm(false);
    setShowDebitForm(false);
    setShowManualTransactionForm(false);
    setShowPromotionForm(false);
    setMoreActionsAnchor(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  const groupKey = (group: TransactionGroup) => `${group.fromDate}-${group.toDate}`;

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

      {/* Current Balance Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Balance
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom>
            {formatCurrency(balance)} credit remaining
          </Typography>
          {lastFundTransaction && (
            <Typography variant="body2" color="text.secondary">
              Last successful payment {lastFundTransaction.modifyDate} ({formatCurrency(lastFundTransaction.amount)} {
                lastFundTransaction.creditCard ? 
                  getCreditCardType(lastFundTransaction.creditCardTypeId) + ' ****' + lastFundTransaction.creditCard : 
                  'PayPal'
              })
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Action Forms */}
      <Box sx={{ mb: 3 }}>
        {/* Credit Form */}
        <Collapse in={showCreditForm}>
          <Card sx={{ mb: 2, bgcolor: '#fff9d7', border: '1px solid #e2c822' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Add Credit</Typography>
                <IconButton onClick={() => setShowCreditForm(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <TextField
                  label="Amount to Credit *"
                  type="number"
                  value={creditForm.amount}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                  inputProps={{ min: 0.01, step: 0.01 }}
                  fullWidth
                />
                <TextField
                  label="Notes / Comments *"
                  multiline
                  rows={3}
                  value={creditForm.comments}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, comments: e.target.value }))}
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleCreditSubmit}
                    disabled={saving}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowCreditForm(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Debit Form */}
        <Collapse in={showDebitForm}>
          <Card sx={{ mb: 2, bgcolor: '#fff9d7', border: '1px solid #e2c822' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Debit</Typography>
                <IconButton onClick={() => setShowDebitForm(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <TextField
                  label="Amount to Debit *"
                  type="number"
                  value={debitForm.amount}
                  onChange={(e) => setDebitForm(prev => ({ ...prev, amount: e.target.value }))}
                  inputProps={{ min: 0.01, step: 0.01, max: balance }}
                  helperText={`The maximum amount for debit is: ${formatCurrency(balance)}`}
                  fullWidth
                />
                <TextField
                  label="Notes / Comments *"
                  multiline
                  rows={3}
                  value={debitForm.comments}
                  onChange={(e) => setDebitForm(prev => ({ ...prev, comments: e.target.value }))}
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleDebitSubmit}
                    disabled={saving}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowDebitForm(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Manual Transaction Form */}
        <Collapse in={showManualTransactionForm}>
          <Card sx={{ mb: 2, bgcolor: '#fff9d7', border: '1px solid #e2c822' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Manual Transaction Handling</Typography>
                <IconButton onClick={() => setShowManualTransactionForm(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <FormControl fullWidth>
                  <InputLabel>Transaction Type *</InputLabel>
                  <Select
                    value={manualTransactionType}
                    onChange={(e) => setManualTransactionType(e.target.value as 'payment' | 'refund')}
                    label="Transaction Type *"
                  >
                    <MenuItem value="refund">Refund</MenuItem>
                    <MenuItem value="payment">Payment</MenuItem>
                  </Select>
                </FormControl>

                {manualTransactionType === 'payment' && (
                  <>
                    <TextField
                      label="Amount of Payment *"
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      inputProps={{ min: 0.01, step: 0.01 }}
                      fullWidth
                    />
                    <TextField
                      label="Notes / Comments *"
                      multiline
                      rows={3}
                      value={paymentForm.comments}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, comments: e.target.value }))}
                      fullWidth
                    />
                  </>
                )}

                {manualTransactionType === 'refund' && (
                  <>
                    <TextField
                      label="Amount to Refund *"
                      type="number"
                      value={refundForm.amount}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, amount: e.target.value }))}
                      inputProps={{ min: 0.01, step: 0.01 }}
                      fullWidth
                    />
                    <TextField
                      label="Notes / Comments *"
                      multiline
                      rows={3}
                      value={refundForm.comments}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, comments: e.target.value }))}
                      fullWidth
                    />
                  </>
                )}

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleManualTransactionSubmit}
                    disabled={saving}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowManualTransactionForm(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Promotion Code Form */}
        <Collapse in={showPromotionForm}>
          <Card sx={{ mb: 2, bgcolor: '#fff9d7', border: '1px solid #e2c822' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Apply Promotion Code</Typography>
                <IconButton onClick={() => setShowPromotionForm(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <TextField
                  label="Promotion Code *"
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value)}
                  fullWidth
                />
                <Typography variant="body2" color="text.secondary">
                  • Once the promotion code amount is used up, we'll continue serving your package and will start charging the form of payment you provided.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • An expiration date often applies, so keep in mind that you only have a certain amount of time to redeem your credit.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      // Handle promotion code submission
                      setShowPromotionForm(false);
                      setPromotionCode('');
                    }}
                    disabled={saving || !promotionCode}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowPromotionForm(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Collapse>
      </Box>

      {/* Transaction Table */}
      <Paper>
        {/* Table Header with Actions */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => {/* Navigate to make payment page */}}
            >
              Make a payment
            </Button>
            
            <Button
              variant="outlined"
              endIcon={<MoreVertIcon />}
              onClick={(e) => setMoreActionsAnchor(e.currentTarget)}
            >
              More actions
            </Button>
            
            <Menu
              anchorEl={moreActionsAnchor}
              open={Boolean(moreActionsAnchor)}
              onClose={() => setMoreActionsAnchor(null)}
            >
              <MenuItem onClick={() => { closeAllForms(); setShowCreditForm(true); }}>
                <AddIcon sx={{ mr: 1 }} />
                Add credit
              </MenuItem>
              <MenuItem onClick={() => { closeAllForms(); setShowDebitForm(true); }}>
                <RemoveIcon sx={{ mr: 1 }} />
                Debit
              </MenuItem>
              <MenuItem onClick={() => { closeAllForms(); setShowManualTransactionForm(true); }}>
                <SwapHorizIcon sx={{ mr: 1 }} />
                Manual transaction handling
              </MenuItem>
              <MenuItem onClick={() => { closeAllForms(); setShowPromotionForm(true); }}>
                <CardGiftcardIcon sx={{ mr: 1 }} />
                Apply a promotional code
              </MenuItem>
            </Menu>
          </Box>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterValue}
              onChange={(e) => handleFilterChange(e.target.value)}
              label="Filter"
            >
              <MenuItem value="">All Transactions</MenuItem>
              <MenuItem value="2">Payments</MenuItem>
              <MenuItem value="3">Charges</MenuItem>
              <MenuItem value="1,4,5,6,7,9,10">Adjustments</MenuItem>
              <MenuItem value="6">Refunds</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 46, textAlign: 'right' }}>#</TableCell>
                <TableCell sx={{ width: 86 }}>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell sx={{ width: 74, textAlign: 'right' }}>Debit</TableCell>
                <TableCell sx={{ width: 74, textAlign: 'right' }}>Credit</TableCell>
                <TableCell sx={{ width: 74, textAlign: 'right' }}>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group) => {
                  const key = groupKey(group);
                  const isExpanded = expandedGroups.has(key);
                  
                  return (
                    <React.Fragment key={key}>
                      {/* Group Header Row */}
                      <TableRow 
                        sx={{ 
                          bgcolor: 'grey.50', 
                          '&:hover': { bgcolor: 'grey.100' }, 
                          cursor: 'pointer' 
                        }}
                        onClick={() => toggleGroupExpansion(key)}
                      >
                        <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            {group.fromDate} - {group.toDate}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                          {group.debit > 0 && formatCurrency(group.debit)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                          {group.credit > 0 && formatCurrency(group.credit)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                          {formatCurrency(group.balance)}
                        </TableCell>
                      </TableRow>
                      
                      {/* Transaction Rows */}
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        {group.transactions.map((transaction) => (
                          <TableRow key={transaction.transactionId}>
                            <TableCell sx={{ textAlign: 'right', pl: 4 }}>
                              {transaction.transactionId}
                            </TableCell>
                            <TableCell sx={{ pl: 4 }}>
                              {new Date(transaction.modifyDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell sx={{ pl: 4 }}>
                              {getTransactionDescription(transaction)}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>
                              {transaction.debit && formatCurrency(transaction.debit)}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>
                              {transaction.credit && formatCurrency(transaction.credit)}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>
                              {formatCurrency(transaction.balance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </Collapse>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Footer */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2">
            <strong>0</strong> - <strong>0</strong> of <strong>0</strong>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TransactionHistoryTab;
