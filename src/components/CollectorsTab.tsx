import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Alert,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import { 
  Search as SearchIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Account } from '../types';
import { opinionApiService as apiService } from '../services';
import { StyledDataGrid, StyledDataGridToolbar } from './common';

interface CollectorsTabProps {
  accountId: number;
  account: Account;
}

interface Collector {
  collectorId: number;
  name: string;
  sourceTypeId: number;
  statusId: number;
  started: number;
  completed: number;
  partial: number;
  timeTaken?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  opinionId: number;
  opinionName: string;
  opinionTypeName: string;
  accountId: number;
  lastResponseDate?: string;
}


const CollectorsTab: React.FC<CollectorsTabProps> = ({ accountId, account }) => {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadCollectors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCollectorsByAccount(accountId);
      setCollectors(response.data.list || []);
    } catch (err) {
      setError('Failed to load collectors for this account');
      console.error('Error loading collectors:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadCollectors();
  }, [loadCollectors]);

  // Reset selection when collectors data changes
  useEffect(() => {
    setSelectionModel([]);
  }, [collectors]);

  // Format collector type based on sourceTypeId
  const getCollectorType = (typeId: number) => {
    switch (typeId) {
      case 1:
        return "Direct link";
      case 2:
        return "CINT panel";
      default:
        return "Unknown";
    }
  };

  // Format collector status based on statusId and typeId
  const getCollectorStatus = (statusId: number, typeId: number) => {
    switch (statusId) {
      case 1:
        return (typeId === 1 ? "Open" : "The panel is live");
      case 2:
        return (typeId === 1 ? "Closed" : "Panel has been completed");
      case 3:
        return "Awaiting payment";
      case 4:
        return "Panel is being verified";
      case 5:
        return "The panel is live";
      case 6:
        return "Panel has been completed";
      case 7:
        return "Pending"; // Hold
      case 8:
        return "Canceled";
      default:
        return "Unknown status";
    }
  };

  // Pagination handlers
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const handleFilterChange = (value: string) => {
    setSearchTerm(value);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page when filtering
  };

  // Handle row selection
  const handleSelectionModelChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectionModel(newSelectionModel);
  };

  // Column definitions for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'collectorId',
      headerName: '#',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => window.open(`/accounts/${accountId}/collectors/${params.row.collectorId}`, '_self')}
          sx={{ textDecoration: 'none' }}
        >
          {params.row.collectorId}
        </Link>
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => window.open(`/accounts/${accountId}/collectors/${params.row.collectorId}`, '_self')}
          sx={{ textDecoration: 'none', textAlign: 'left' }}
          title={params.row.name}
        >
          {params.row.name}
        </Link>
      )
    },
    {
      field: 'sourceTypeId',
      headerName: 'Type',
      width: 130,
      renderCell: (params) => getCollectorType(params.row.sourceTypeId)
    },
    {
      field: 'statusId',
      headerName: 'Status',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={getCollectorStatus(params.row.statusId, params.row.sourceTypeId)}
          size="small"
          color={params.row.statusId === 1 ? 'success' : params.row.statusId === 8 ? 'error' : 'default'}
          variant={params.row.statusId === 1 ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'started',
      headerName: 'Responses',
      width: 110,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => params.row.started.toLocaleString()
    },
    {
      field: 'completed',
      headerName: 'Completed',
      width: 110,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => params.row.completed.toLocaleString()
    },
    {
      field: 'completionRate',
      headerName: 'Completion Rate',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      valueGetter: (params) => {
        if (!params || !params.row) return '0.00%';
        return calculateCompletionRate(params.row.completed, params.row.started);
      },
      renderCell: (params) => {
        if (!params || !params.row) return '0.00%';
        return calculateCompletionRate(params.row.completed, params.row.started);
      }
    },
    {
      field: 'partial',
      headerName: 'Partial',
      width: 100,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => params.row.partial.toLocaleString()
    },
    {
      field: 'disqualified',
      headerName: 'Disqualified',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: () => '0' // Always 0 per original implementation
    },
    {
      field: 'timeTaken',
      headerName: 'Avg. Time Taken',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: (params) => formatTimeTaken(params.row.timeTaken)
    },
    {
      field: 'opinionName',
      headerName: 'Survey',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => window.open(`/accounts/${accountId}?tab=surveys`, '_self')}
          sx={{ textDecoration: 'none' }}
          title={`[${params.row.opinionTypeName}] ${params.row.opinionName}`}
        >
          {params.row.opinionName}
        </Link>
      )
    },
    {
      field: 'lastResponseDate',
      headerName: 'Last Response Date',
      width: 180,
      type: 'date',
      valueGetter: (params) => {
        if (!params || !params.row || !params.row.lastResponseDate) return null;
        return new Date(params.row.lastResponseDate);
      },
      renderCell: (params) => {
        if (!params || !params.row) return '--';
        return formatLastResponseDate(params.row.lastResponseDate);
      }
    }
  ];

  // Filter collectors based on search term and map to DataGrid format
  const filteredCollectors = collectors
    .filter(collector =>
      collector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collector.opinionName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(collector => ({
      ...collector,
      id: collector.collectorId // DataGrid requires an 'id' field
    }));


  const formatTimeTaken = (timeTaken?: Collector['timeTaken']) => {
    if (!timeTaken) return '--';
    
    const { days, hours, minutes, seconds } = timeTaken;
    
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      return 'Less than sec';
    }
    
    let result = '';
    if (days > 0) result += `${days} day${days > 1 ? 's' : ''}, `;
    if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''}, `;
    if (minutes > 0) result += `${minutes} min${minutes > 1 ? 's' : ''}, `;
    if (seconds > 0) result += `${seconds} sec${seconds > 1 ? 's' : ''}`;
    
    return result.replace(/, $/, '');
  };

  const formatLastResponseDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    
    try {
      // Parse the date and format like the original: "Jan 15, 2024 14:30:22"
      const date = new Date(dateStr);
      const datePart = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const timePart = date.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      return `${datePart} ${timePart}`;
    } catch {
      return dateStr;
    }
  };

  const calculateCompletionRate = (completed: number, started: number) => {
    if (started === 0) return '0.00%';
    return ((completed / started) * 100).toFixed(2) + '%';
  };

  const calculateTotals = () => {
    return filteredCollectors.reduce((totals, collector) => ({
      started: totals.started + collector.started,
      completed: totals.completed + collector.completed,
      partial: totals.partial + collector.partial,
      disqualified: 0, // Always 0 in the original
    }), { started: 0, completed: 0, partial: 0, disqualified: 0 });
  };

  const totals = calculateTotals();

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // Check if we can delete selected collectors (can't delete live CINT panels)
  const canDeleteSelected = () => {
    const selectedIds = Array.isArray(selectionModel) ? selectionModel.map(id => Number(id)) : [];
    return selectedIds.every(collectorId => {
      const collector = collectors.find(c => c.collectorId === collectorId);
      // Can't delete live CINT panels (sourceTypeId = 2 and statusId = 1)
      return !(collector && collector.sourceTypeId === 2 && collector.statusId === 1);
    });
  };

  const handleDelete = async () => {
    try {
      const selectedIds = Array.isArray(selectionModel) ? selectionModel.map(id => Number(id)) : [];
      
      // Filter out collectors that can't be deleted (live CINT panels)
      const deletableCollectors = selectedIds.filter(collectorId => {
        const collector = collectors.find(c => c.collectorId === collectorId);
        return !(collector && collector.sourceTypeId === 2 && collector.statusId === 1);
      });

      if (deletableCollectors.length > 0) {
        await apiService.deleteCollectors(deletableCollectors);
        setSuccess(`${deletableCollectors.length} collector(s) deleted successfully`);
        
        // Reload collectors
        loadCollectors();
      }
      
      setDeleteDialogOpen(false);
      setSelectionModel([]);
    } catch (err) {
      setError('Failed to delete collectors');
      console.error('Error deleting collectors:', err);
    }
  };

  if (loading) {
    return <Typography>Loading collectors...</Typography>;
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Toolbar with Search and Actions */}
      <StyledDataGridToolbar>
        <TextField
          size="small"
          placeholder="Search collectors..."
          value={searchTerm}
          onChange={(e) => handleFilterChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </StyledDataGridToolbar>

      {/* Collectors DataGrid */}
      <Paper sx={{ p: 0 }}>
        <StyledDataGrid
          rows={filteredCollectors}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          disableRowSelectionOnClick
          autoHeight
        />
      </Paper>
      

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Deleting collectors</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete selected collectors?</Typography>
          {!canDeleteSelected() && (
            <Typography color="warning.main" sx={{ mt: 1 }}>
              Note: Live CINT panels cannot be deleted and will be skipped.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default CollectorsTab;
