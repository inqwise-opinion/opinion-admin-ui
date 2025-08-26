import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Link,
  TableSortLabel,
  Chip,
} from '@mui/material';
import { opinionApiService as apiService } from '../../services';
import { useNavigate } from 'react-router-dom';

interface RecurringTabProps {
  accountId: number;
}

interface RecurringCharge {
  chargeId: number;
  nextDate: string;
  chargeName: string;
  amount: number;
  isTaxable: boolean;
  cycle: string;
}

type SortField = 'chargeId' | 'nextDate' | 'chargeName' | 'amount' | 'isTaxable' | 'cycle';
type SortDirection = 'asc' | 'desc';

const RecurringTab: React.FC<RecurringTabProps> = ({ accountId }) => {
  const navigate = useNavigate();
  const [recurringCharges, setRecurringCharges] = useState<RecurringCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Selection and pagination state
  const [selectedCharges, setSelectedCharges] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('chargeId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    loadRecurringCharges();
  }, [accountId]);

  const loadRecurringCharges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get recurring charges for the account
      const response = await apiService.getRecurringCharges(accountId);
      
      if (response.success) {
        setRecurringCharges(response.data.list || []);
      } else {
        throw new Error(response.error?.message || 'Failed to load recurring charges');
      }
    } catch (err: any) {
      console.error('Error loading recurring charges:', err);
      setError(err.message || 'Failed to load recurring charges');
      setRecurringCharges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCharges = async () => {
    if (selectedCharges.length === 0) return;
    
    try {
      setProcessing(true);
      setError(null);
      
      // Delete each selected recurring charge
      const promises = selectedCharges.map(chargeId => 
        apiService.deleteRecurringCharge(chargeId)
      );
      
      const results = await Promise.allSettled(promises);
      
      // Check if all deletions were successful
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} recurring charge(s)`);
      }
      
      setSuccess(`Successfully deleted ${selectedCharges.length} recurring charge(s)`);
      setSelectedCharges([]);
      
      // Reload recurring charges
      await loadRecurringCharges();
      
    } catch (err: any) {
      setError(err.message || 'Failed to delete recurring charges');
    } finally {
      setProcessing(false);
    }
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
    setPage(0);
  };

  const sortRecurringCharges = (chargesToSort: RecurringCharge[]) => {
    return chargesToSort.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'chargeId':
          aValue = a.chargeId;
          bValue = b.chargeId;
          break;
        case 'nextDate':
          aValue = new Date(a.nextDate).getTime();
          bValue = new Date(b.nextDate).getTime();
          break;
        case 'chargeName':
          aValue = a.chargeName.toLowerCase();
          bValue = b.chargeName.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'isTaxable':
          aValue = a.isTaxable ? 1 : 0;
          bValue = b.isTaxable ? 1 : 0;
          break;
        case 'cycle':
          aValue = a.cycle.toLowerCase();
          bValue = b.cycle.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelectedIds = paginatedCharges.map(charge => charge.chargeId);
      setSelectedCharges(prev => Array.from(new Set([...prev, ...newSelectedIds])));
    } else {
      const pageChargeIds = paginatedCharges.map(charge => charge.chargeId);
      setSelectedCharges(prev => prev.filter(id => !pageChargeIds.includes(id)));
    }
  };

  const handleSelectCharge = (chargeId: number) => {
    setSelectedCharges(prev => 
      prev.includes(chargeId)
        ? prev.filter(id => id !== chargeId)
        : [...prev, chargeId]
    );
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChargeClick = (chargeId: number) => {
    // Navigate to charge details page
    navigate(`/charges/${chargeId}`);
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatNextDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      // Format similar to original: remove the time part
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      return formatted;
    } catch {
      return dateStr;
    }
  };

  const sortedCharges = sortRecurringCharges([...recurringCharges]);
  const paginatedCharges = sortedCharges.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const isAllPageSelected = paginatedCharges.length > 0 && 
    paginatedCharges.every(charge => selectedCharges.includes(charge.chargeId));
  const isIndeterminate = paginatedCharges.some(charge => selectedCharges.includes(charge.chargeId)) && !isAllPageSelected;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Recurring Charges
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {recurringCharges.length} recurring charge(s) found
        </Typography>
      </Box>

      {/* Alerts */}
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

      {/* Action buttons */}
      {selectedCharges.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteCharges}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} /> : undefined}
          >
            {processing ? 'Deleting...' : `Delete (${selectedCharges.length})`}
          </Button>
        </Box>
      )}

      {/* Recurring charges table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllPageSelected}
                    onChange={handleSelectAll}
                    disabled={recurringCharges.length === 0}
                  />
                </TableCell>
                <TableCell align="right" sx={{ width: 46 }}>
                  <TableSortLabel
                    active={sortField === 'chargeId'}
                    direction={sortField === 'chargeId' ? sortDirection : 'asc'}
                    onClick={() => handleSort('chargeId')}
                  >
                    #
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: 124 }}>
                  <TableSortLabel
                    active={sortField === 'nextDate'}
                    direction={sortField === 'nextDate' ? sortDirection : 'asc'}
                    onClick={() => handleSort('nextDate')}
                  >
                    Next Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'chargeName'}
                    direction={sortField === 'chargeName' ? sortDirection : 'asc'}
                    onClick={() => handleSort('chargeName')}
                  >
                    Charge Name
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ width: 74 }}>
                  <TableSortLabel
                    active={sortField === 'amount'}
                    direction={sortField === 'amount' ? sortDirection : 'asc'}
                    onClick={() => handleSort('amount')}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: 60 }}>
                  <TableSortLabel
                    active={sortField === 'isTaxable'}
                    direction={sortField === 'isTaxable' ? sortDirection : 'asc'}
                    onClick={() => handleSort('isTaxable')}
                  >
                    Taxable
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: 160 }}>
                  <TableSortLabel
                    active={sortField === 'cycle'}
                    direction={sortField === 'cycle' ? sortDirection : 'asc'}
                    onClick={() => handleSort('cycle')}
                  >
                    Cycle
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCharges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCharges.map((charge) => (
                  <TableRow key={charge.chargeId} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCharges.includes(charge.chargeId)}
                        onChange={() => handleSelectCharge(charge.chargeId)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Link
                        component="button"
                        onClick={() => handleChargeClick(charge.chargeId)}
                        sx={{ textDecoration: 'none' }}
                      >
                        {charge.chargeId}
                      </Link>
                    </TableCell>
                    <TableCell>{formatNextDate(charge.nextDate)}</TableCell>
                    <TableCell>
                      <Link
                        component="button"
                        onClick={() => handleChargeClick(charge.chargeId)}
                        sx={{ textDecoration: 'none' }}
                        title={charge.chargeName}
                      >
                        {charge.chargeName}
                      </Link>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(charge.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={charge.isTaxable ? 'Yes' : 'No'}
                        size="small"
                        color={charge.isTaxable ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{charge.cycle}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {recurringCharges.length > 0 && (
          <TablePagination
            component="div"
            count={recurringCharges.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />
        )}
      </Paper>

      {/* Results summary */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Displaying:</strong> {Math.min(page * rowsPerPage + 1, recurringCharges.length)} - {Math.min((page + 1) * rowsPerPage, recurringCharges.length)} of {recurringCharges.length} recurring charges
          {selectedCharges.length > 0 && (
            <>
              {' • '}
              <strong>Selected:</strong> {selectedCharges.length} charge(s)
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default RecurringTab;
