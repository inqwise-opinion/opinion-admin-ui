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

interface ChargesTabProps {
  accountId: number;
}

interface Charge {
  chargeId: number;
  chargeDate: string;
  name: string;
  amount: number;
  statusId: number;
  invoiced?: boolean;
}

type SortField = 'chargeId' | 'chargeDate' | 'name' | 'amount';
type SortDirection = 'asc' | 'desc';

const ChargesTab: React.FC<ChargesTabProps> = ({ accountId }) => {
  const navigate = useNavigate();
  const [charges, setCharges] = useState<Charge[]>([]);
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
    loadCharges();
  }, [accountId]);

  const loadCharges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all paid charges (statusId: 2)
      const response = await apiService.getCharges(accountId, [], 2, false); // statusId 2 = paid, invoiced = false
      
      if (response.success) {
        setCharges(response.data.list || []);
      } else {
        throw new Error(response.error?.message || 'Failed to load charges');
      }
    } catch (err: any) {
      console.error('Error loading charges:', err);
      setError(err.message || 'Failed to load charges');
      setCharges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCharges = async () => {
    if (selectedCharges.length === 0) return;
    
    try {
      setProcessing(true);
      setError(null);
      
      // Cancel each selected charge
      const promises = selectedCharges.map(chargeId => 
        apiService.cancelCharge(accountId, chargeId)
      );
      
      const results = await Promise.allSettled(promises);
      
      // Check if all cancellations were successful
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        throw new Error(`Failed to cancel ${failures.length} charge(s)`);
      }
      
      setSuccess(`Successfully cancelled ${selectedCharges.length} charge(s)`);
      setSelectedCharges([]);
      
      // Reload charges
      await loadCharges();
      
    } catch (err: any) {
      setError(err.message || 'Failed to cancel charges');
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

  const sortCharges = (chargesToSort: Charge[]) => {
    return chargesToSort.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'chargeId':
          aValue = a.chargeId;
          bValue = b.chargeId;
          break;
        case 'chargeDate':
          aValue = new Date(a.chargeDate).getTime();
          bValue = new Date(b.chargeDate).getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
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
    navigate(`/accounts/${accountId}/charges/${chargeId}`);
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

  const getChargeStatus = (statusId: number): string => {
    switch (statusId) {
      case 1: return 'Unpaid';
      case 2: return 'Paid';
      case 3: return 'Void';
      case 4: return 'Refunded';
      case 5: return 'Credited';
      case 6: return 'Pending';
      case 7: return 'Canceled';
      default: return 'Unknown';
    }
  };

  const getChargeStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return 'warning';
      case 2: return 'success';
      case 3: return 'default';
      case 4: return 'info';
      case 5: return 'info';
      case 6: return 'warning';
      case 7: return 'error';
      default: return 'default';
    }
  };

  const sortedCharges = sortCharges([...charges]);
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
          Charges
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {charges.length} charge(s) found
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
            onClick={handleCancelCharges}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} /> : undefined}
          >
            {processing ? 'Canceling...' : `Cancel (${selectedCharges.length})`}
          </Button>
        </Box>
      )}

      {/* Charges table */}
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
                    disabled={charges.length === 0}
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
                <TableCell sx={{ width: 126 }}>
                  <TableSortLabel
                    active={sortField === 'chargeDate'}
                    direction={sortField === 'chargeDate' ? sortDirection : 'asc'}
                    onClick={() => handleSort('chargeDate')}
                  >
                    Charge Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortDirection : 'asc'}
                    onClick={() => handleSort('name')}
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
                <TableCell sx={{ width: 100 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCharges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
                    <TableCell>{formatDate(charge.chargeDate)}</TableCell>
                    <TableCell>
                      <Link
                        component="button"
                        onClick={() => handleChargeClick(charge.chargeId)}
                        sx={{ textDecoration: 'none' }}
                        title={charge.name}
                      >
                        {charge.name}
                      </Link>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(charge.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getChargeStatus(charge.statusId)}
                        size="small"
                        color={getChargeStatusColor(charge.statusId) as any}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {charges.length > 0 && (
          <TablePagination
            component="div"
            count={charges.length}
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
          <strong>Displaying:</strong> {Math.min(page * rowsPerPage + 1, charges.length)} - {Math.min((page + 1) * rowsPerPage, charges.length)} of {charges.length} charges
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

export default ChargesTab;
