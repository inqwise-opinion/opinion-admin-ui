import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  IconButton,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Toolbar,
  TablePagination,
  Chip,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Receipt as InvoiceIcon,
  Merge as MergeIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { opinionApiService as apiService } from '../../services';

interface UnInvoicedCharge {
  chargeId: number;
  chargeDate: string;
  name: string;
  amount: number;
  statusId: number;
  invoiced: boolean;
}

interface DraftInvoice {
  invoiceId: number;
  insertDate: string;
  statusId: number;
  status: string;
  amount: number;
}

interface UnInvoicedListTabProps {
  accountId: number;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  disablePadding: boolean;
  id: keyof UnInvoicedCharge;
  label: string;
  numeric: boolean;
  sortable: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'chargeId',
    numeric: true,
    disablePadding: false,
    label: '#',
    sortable: true,
  },
  {
    id: 'chargeDate',
    numeric: false,
    disablePadding: false,
    label: 'Charge Date',
    sortable: true,
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'Charge Name',
    sortable: true,
  },
  {
    id: 'amount',
    numeric: true,
    disablePadding: false,
    label: 'Amount',
    sortable: true,
  },
];

const UnInvoicedListTab: React.FC<UnInvoicedListTabProps> = ({ accountId }) => {
  const [charges, setCharges] = useState<UnInvoicedCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof UnInvoicedCharge>('chargeDate');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Action menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Modal states
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [mergeInvoiceOpen, setMergeInvoiceOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | ''>('');
  const [draftInvoices, setDraftInvoices] = useState<DraftInvoice[]>([]);
  
  // Operation states
  const [creating, setCreating] = useState(false);
  const [merging, setMerging] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUninvoicedCharges();
  }, [accountId]);

  const loadUninvoicedCharges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUninvoicedCharges(accountId);
      if (response.success) {
        setCharges(response.data.list);
      } else {
        throw new Error('Failed to load uninvoiced charges');
      }
    } catch (err) {
      console.error('Error loading uninvoiced charges:', err);
      setError('Failed to load uninvoiced charges');
    } finally {
      setLoading(false);
    }
  };

  const loadDraftInvoices = async () => {
    try {
      const response = await apiService.getDraftInvoices(accountId);
      if (response.success) {
        setDraftInvoices(response.data.list);
      }
    } catch (err) {
      console.error('Error loading draft invoices:', err);
    }
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof UnInvoicedCharge,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = charges.map((charge) => charge.chargeId);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, chargeId: number) => {
    const selectedIndex = selected.indexOf(chargeId);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, chargeId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateInvoice = async () => {
    if (selected.length === 0) return;

    try {
      setCreating(true);
      const response = await apiService.createInvoice(accountId, selected);
      if (response.success) {
        const invoiceId = response.data.invoiceId;
        setSuccessMessage(`Invoice #${invoiceId} created successfully`);
        setCreateInvoiceOpen(false);
        setSelected([]);
        await loadUninvoicedCharges(); // Refresh the list
        
        // Show success dialog with option to view invoice
        if (invoiceId) {
          // In a real app, you would navigate to the invoice view
          console.log('Navigate to invoice:', invoiceId);
        }
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  const handleMergeIntoInvoice = async () => {
    if (selected.length === 0 || !selectedInvoiceId) return;

    try {
      setMerging(true);
      const response = await apiService.mergeChargesIntoInvoice(
        accountId, 
        selectedInvoiceId as number, 
        selected
      );
      if (response.success) {
        setSuccessMessage(`Successfully merged ${selected.length} charges into invoice #${selectedInvoiceId}`);
        setMergeInvoiceOpen(false);
        setSelected([]);
        setSelectedInvoiceId('');
        await loadUninvoicedCharges(); // Refresh the list
      }
    } catch (err) {
      console.error('Error merging charges:', err);
      setError('Failed to merge charges into invoice');
    } finally {
      setMerging(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenCreateInvoice = () => {
    setCreateInvoiceOpen(true);
    handleMenuClose();
  };

  const handleOpenMergeInvoice = async () => {
    await loadDraftInvoices();
    setMergeInvoiceOpen(true);
    handleMenuClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const descendingComparator = <T,>(a: T, b: T, orderBy: keyof T) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const getComparator = <Key extends keyof any>(
    order: Order,
    orderBy: Key,
  ): (
    a: { [key in Key]: number | string | boolean },
    b: { [key in Key]: number | string | boolean },
  ) => number => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const stableSort = <T,>(array: readonly T[], comparator: (a: T, b: T) => number) => {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const isSelected = (chargeId: number) => selected.indexOf(chargeId) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - charges.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      stableSort(charges, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [charges, order, orderBy, page, rowsPerPage],
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selected.length > 0 && {
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark,
            }),
          }}
        >
          {selected.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selected.length} selected
            </Typography>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              Uninvoiced Charges
            </Typography>
          )}

          {selected.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<InvoiceIcon />}
                onClick={handleOpenCreateInvoice}
                disabled={creating}
                size="small"
              >
                Create Invoice
              </Button>
              <IconButton
                color="inherit"
                onClick={handleMenuClick}
                disabled={creating || merging}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>

        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < charges.length}
                    checked={charges.length > 0 && selected.length === charges.length}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'select all charges',
                    }}
                  />
                </TableCell>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    padding={headCell.disablePadding ? 'none' : 'normal'}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.chargeId);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.chargeId)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.chargeId}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {row.chargeId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDate(row.chargeDate)}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={row.name}>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {row.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(row.amount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={5} />
                </TableRow>
              )}
              {charges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                      No uninvoiced charges found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={charges.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenMergeInvoice}>
          <MergeIcon sx={{ mr: 1 }} />
          Merge Into Existing Invoice
        </MenuItem>
      </Menu>

      {/* Create Invoice Dialog */}
      <Dialog
        open={createInvoiceOpen}
        onClose={() => !creating && setCreateInvoiceOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to create a new invoice with {selected.length} selected charges?
          </Typography>
          {selected.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected Charges:
              </Typography>
              {charges
                .filter(charge => selected.includes(charge.chargeId))
                .map(charge => (
                  <Box key={charge.chargeId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{charge.name}</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(charge.amount)}
                    </Typography>
                  </Box>
                ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2">Total:</Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {formatCurrency(
                    charges
                      .filter(charge => selected.includes(charge.chargeId))
                      .reduce((sum, charge) => sum + charge.amount, 0)
                  )}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateInvoiceOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateInvoice} 
            variant="contained" 
            disabled={creating}
            startIcon={creating ? <CircularProgress size={20} /> : <InvoiceIcon />}
          >
            {creating ? 'Creating...' : 'Create Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Merge Into Invoice Dialog */}
      <Dialog
        open={mergeInvoiceOpen}
        onClose={() => !merging && setMergeInvoiceOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Merge Into Existing Invoice</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Select a draft invoice to merge {selected.length} charges into:
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="invoice-select-label">Draft Invoice</InputLabel>
            <Select
              labelId="invoice-select-label"
              value={selectedInvoiceId}
              label="Draft Invoice"
              onChange={(event: SelectChangeEvent<number | string>) => 
                setSelectedInvoiceId(event.target.value as number)
              }
              disabled={merging}
            >
              {draftInvoices.map((invoice) => (
                <MenuItem key={invoice.invoiceId} value={invoice.invoiceId}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>Invoice #{invoice.invoiceId}</span>
                    <span>{formatCurrency(invoice.amount)}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selected.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Charges to Merge ({selected.length}):
              </Typography>
              {charges
                .filter(charge => selected.includes(charge.chargeId))
                .slice(0, 3) // Show first 3
                .map(charge => (
                  <Box key={charge.chargeId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontSize="0.875rem">{charge.name}</Typography>
                    <Typography variant="body2" fontSize="0.875rem">
                      {formatCurrency(charge.amount)}
                    </Typography>
                  </Box>
                ))}
              {selected.length > 3 && (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  ... and {selected.length - 3} more
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeInvoiceOpen(false)} disabled={merging}>
            Cancel
          </Button>
          <Button 
            onClick={handleMergeIntoInvoice}
            variant="contained"
            disabled={merging || !selectedInvoiceId}
            startIcon={merging ? <CircularProgress size={20} /> : <MergeIcon />}
          >
            {merging ? 'Merging...' : 'Merge Charges'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnInvoicedListTab;
