import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Link,
  TextField,
  InputAdornment,
  Typography
} from '@mui/material';
import {
  GridColDef,
  GridRowParams,
  GridSelectionModel,
  GridActionsCellItem,
  GridPaginationModel
} from '@mui/x-data-grid';
import { Delete as DeleteIcon, Search as SearchIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { InvoiceListItem, InvoiceListFilter } from '../types';
import { opinionApiService } from '../services';
import { StyledDataGrid, StyledDataGridToolbar, PageTabs } from '../components/common';
import { TabDefinition } from '../components/common/PageTabs';

const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<GridSelectionModel>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filter, setFilter] = useState<InvoiceListFilter>({ statusId: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [activeTabFilter, setActiveTabFilter] = useState<{ statusId: number | null }>({ statusId: null });

  // Load invoices based on active tab filter
  const loadInvoices = async (statusId: number | null = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await opinionApiService.getAllInvoices({ statusId });
      if (response.success && response.data) {
        setInvoices(response.data.list || []);
      } else {
        setError(response.error?.message || 'Failed to load invoices');
        setInvoices([]);
      }
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      setError(err.message || 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Set document title
  useEffect(() => {
    document.title = 'Billing - Opinion Admin Dashboard';
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Opinion Admin Dashboard';
    };
  }, []);

  // Load invoices when component mounts or active tab filter changes
  useEffect(() => {
    loadInvoices(activeTabFilter.statusId);
  }, [activeTabFilter]);

  // Handle filter change for Invoice List tab
  const handleFilterChange = (event: SelectChangeEvent<number | null>) => {
    const value = event.target.value;
    setFilter({ statusId: value === '' ? null : Number(value) });
    setSelectedInvoices([]); // Clear selection when filter changes
    // Only reload if we're on the Invoice List tab (statusId: null)
    if (activeTabFilter.statusId === null) {
      loadInvoices(value === '' ? null : Number(value));
    }
  };

  // Handle pagination
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page when searching
  };

  // Handle selection change
  const handleSelectionModelChange = (selectionModel: GridSelectionModel) => {
    setSelectedInvoices(selectionModel);
  };

  // Handle delete invoices
  const handleDeleteInvoices = async () => {
    if (selectedInvoices.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const invoiceIds = selectedInvoices.map(id => Number(id));
      const response = await opinionApiService.deleteBillingInvoices(invoiceIds);
      
      if (response.success) {
        // Reload invoices after successful deletion
        await loadInvoices();
        setSelectedInvoices([]);
        setDeleteDialogOpen(false);
      } else {
        setError(response.error?.message || 'Failed to delete invoices');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete invoices');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get status chip
  const getStatusChip = (statusId: number) => {
    switch (statusId) {
      case 1:
        return <Chip label="Draft" size="small" color="default" />;
      case 2:
        return <Chip label="Open" size="small" color="primary" />;
      case 3:
        return <Chip label="Paid" size="small" color="success" />;
      case 4:
        return <Chip label="Overdue" size="small" color="error" />;
      default:
        return <Chip label="Unknown" size="small" color="default" />;
    }
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice =>
    invoice.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceId.toString().includes(searchTerm) ||
    invoice.invoiceDate.toLowerCase().includes(searchTerm.toLowerCase())
  ).map(invoice => ({
    ...invoice,
    id: invoice.invoiceId // For DataGrid consistency
  }));

  // Column definitions for Invoice List
  const invoiceColumns: GridColDef[] = [
    {
      field: 'invoiceId',
      headerName: 'ID',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => console.log('Navigate to invoice:', params.row.invoiceId)}
          sx={{ textDecoration: 'none' }}
        >
          {params.row.invoiceId}
        </Link>
      )
    },
    {
      field: 'accountName',
      headerName: 'Account',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => console.log('Navigate to account:', params.row.accountName)}
          sx={{ textDecoration: 'none' }}
        >
          {params.row.accountName}
        </Link>
      )
    },
    {
      field: 'invoiceDate',
      headerName: 'Invoice Date',
      width: 140,
      type: 'date',
      valueGetter: (params) => new Date(params.value),
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.invoiceDate}
        </Typography>
      )
    },
    {
      field: 'fromDate',
      headerName: 'From Date',
      width: 130,
      type: 'date',
      valueGetter: (params) => new Date(params.value),
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.fromDate}
        </Typography>
      )
    },
    {
      field: 'toDate',
      headerName: 'To Date',
      width: 130,
      type: 'date',
      valueGetter: (params) => new Date(params.value),
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.toDate}
        </Typography>
      )
    },
    {
      field: 'statusId',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => getStatusChip(params.row.statusId)
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {formatCurrency(params.row.amount)}
        </Typography>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label="View"
          onClick={() => console.log('View invoice:', params.row.invoiceId)}
        />,
      ],
    },
  ];

  // Column definitions for UnInvoiced List (without status)
  const uninvoicedColumns: GridColDef[] = invoiceColumns.filter(col => col.field !== 'statusId');

  // Delete confirmation function for both tabs
  const confirmDelete = async () => {
    try {
      const invoiceIds = selectedInvoices.map(id => Number(id));
      await opinionApiService.deleteBillingInvoices(invoiceIds);
      setSuccess(`Successfully deleted ${selectedInvoices.length} invoice(s)`);
      setDeleteDialogOpen(false);
      setSelectedInvoices([]);
      loadInvoices(activeTabFilter.statusId);
    } catch (err: any) {
      console.error('Failed to delete invoices:', err);
      setError('Failed to delete invoices');
    }
  };

  // Create tab components
  const createInvoiceListTab = (statusFilter: number | null, isUnInvoiced = false) => {
    // Filter invoices based on current tab filter and search term
    const currentInvoices = filteredInvoices.filter(invoice => {
      // Apply status filter based on tab
      const statusMatch = statusFilter === null || invoice.statusId === statusFilter;
      return statusMatch;
    });

    // Use appropriate columns based on tab type
    const columns = isUnInvoiced ? uninvoicedColumns : invoiceColumns;
    const placeholder = isUnInvoiced ? "Search draft invoices..." : "Search invoices...";

    return (
      <Box>
        {/* Toolbar */}
        <StyledDataGridToolbar>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            {!isUnInvoiced && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filter.statusId ?? ''}
                  label="Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value={1}>Draft</MenuItem>
                  <MenuItem value={2}>Open</MenuItem>
                  <MenuItem value={3}>Paid</MenuItem>
                  <MenuItem value={4}>Overdue</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={selectedInvoices.length === 0 || loading}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Selected ({selectedInvoices.length})
          </Button>
        </StyledDataGridToolbar>

        {/* DataGrid */}
        <Paper sx={{ p: 0 }}>
          <StyledDataGrid
            rows={currentInvoices}
            columns={columns}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            selectionModel={selectedInvoices}
            onSelectionModelChange={handleSelectionModelChange}
            disableSelectionOnClick
            autoHeight
            getRowClassName={(params) => 
              params.row.statusId === 4 ? 'overdue-row' : ''
            }
          />
        </Paper>
      </Box>
    );
  };

  // Define tab configurations for PageTabs
  const tabs: TabDefinition[] = [
    {
      key: 'invoices',
      label: 'Invoice List',
      component: createInvoiceListTab(null, false)
    },
    {
      key: 'uninvoiced',
      label: 'UnInvoiced List', 
      component: createInvoiceListTab(1, true) // statusId 1 = Draft
    }
  ];

  // Handle tab change to update the active filter
  const handleTabChangeCallback = (newTabKey: string) => {
    if (newTabKey === 'uninvoiced') {
      setActiveTabFilter({ statusId: 1 }); // Draft invoices only
    } else {
      setActiveTabFilter({ statusId: null }); // All invoices
    }
    setSelectedInvoices([]); // Clear selections when switching tabs
  };

  return (
    <>
      <PageTabs
        tabs={tabs}
        entityName="Billing"
        error={error}
        success={success}
        onErrorClose={() => setError(null)}
        onSuccessClose={() => setSuccess(null)}
        className="content-container"
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedInvoices.length} selected
          invoice(s)? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoicesPage;
