import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  ButtonGroup,
  Alert,
  Link,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  GridColDef,
  GridRowParams,
  GridActionsCellItem,
  GridPaginationModel,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import { 
  Search as SearchIcon,
  Preview as PreviewIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material';
import { Account } from '../types';
import { opinionApiService as apiService } from '../services';
import { StyledDataGrid, StyledDataGridToolbar } from './common';

interface SurveysTabProps {
  accountId: number;
  account: Account;
}

interface Survey {
  opinionId: number;
  name: string;
  started: number;
  completed: number;
  partial: number;
  disqualified: number;
  timeTaken?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  modifyDate: string;
  cntControls: number;
  previewUrl: string;
}


const SurveysTab: React.FC<SurveysTabProps> = ({ accountId, account }) => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [selectedSurveys, setSelectedSurveys] = useState<GridRowSelectionModel>([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [copyToAccountId, setCopyToAccountId] = useState('');
  const [copySurveyName, setCopySurveyName] = useState('');
  const [exportFilename, setExportFilename] = useState('');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  
  // Column visibility state
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    opinionId: true,
    preview: false, // Hidden by default (moved to actions)
    name: true,
    started: true,
    completed: false, // Hidden by default
    completionRate: true,
    partial: false, // Hidden by default
    disqualified: false, // Hidden by default
    timeTaken: false, // Hidden by default (Average Time Taken)
    modifyDate: false, // Hidden by default
    cntControls: true,
    actions: true,
  });

  const loadSurveys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getOpinionsList(accountId, 1); // opinionTypeId = 1 for surveys
      setSurveys(response.data.list || []);
    } catch (err) {
      setError('Failed to load surveys for this account');
      console.error('Error loading surveys:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);


  // Modern pagination handlers
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const handleFilterChange = (value: string) => {
    setSearchTerm(value);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page when filtering
  };

  const handleSelectionModelChange = (selectionModel: GridRowSelectionModel) => {
    setSelectedSurveys(selectionModel || []);
  };

  // Filter surveys based on search term
  const filteredSurveys = surveys.filter(survey =>
    survey.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).map(survey => ({
    ...survey,
    id: survey.opinionId // For DataGrid consistency
  }));

  // Column definitions for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'opinionId',
      headerName: '#',
      width: 80,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Link
          component="button"
          onClick={() => navigate(`/accounts/${accountId}/surveys/${params.row.opinionId}`)}
          sx={{ textDecoration: 'none' }}
        >
          {params.row.opinionId}
        </Link>
      )
    },
    {
      field: 'preview',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title={`Preview: ${params.row.name}`}>
          <IconButton 
            size="small" 
            onClick={() => window.open(params.row.previewUrl, '_blank')}
          >
            <PreviewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
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
          onClick={() => navigate(`/accounts/${accountId}/surveys/${params.row.opinionId}`)}
          sx={{ 
            textDecoration: 'none', 
            textAlign: 'left',
            display: 'block',
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={params.row.name}
        >
          {params.row.name}
        </Link>
      )
    },
    {
      field: 'started',
      headerName: 'Responses',
      width: 120,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.started.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'completed',
      headerName: 'Completed',
      width: 120,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.completed.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'completionRate',
      headerName: 'Completion Rate',
      width: 130,
      sortable: false,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Chip 
          label={calculateCompletionRate(params.row.completed, params.row.started)}
          size="small"
          variant="outlined"
          color={parseInt(calculateCompletionRate(params.row.completed, params.row.started)) > 50 ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'partial',
      headerName: 'Partial',
      width: 100,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.partial.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'disqualified',
      headerName: 'Disqualified',
      width: 110,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.disqualified.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'timeTaken',
      headerName: 'Avg. Time Taken',
      width: 140,
      sortable: false,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2">
          {formatTimeTaken(params.row.timeTaken)}
        </Typography>
      )
    },
    {
      field: 'modifyDate',
      headerName: 'Modify Date',
      width: 160,
      type: 'date',
      valueGetter: (params) => new Date(params.value),
      renderCell: (params) => (
        <Typography variant="body2">
          {formatModifyDate(params.row.modifyDate)}
        </Typography>
      )
    },
    {
      field: 'cntControls',
      headerName: 'Questions',
      width: 100,
      type: 'number',
      headerAlign: 'right',
      align: 'right'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      getActions: (params: GridRowParams) => [
        <Tooltip key="preview" title="Preview" placement="top">
          <GridActionsCellItem
            icon={<PreviewIcon />}
            label="Preview"
            onClick={() => window.open(params.row.previewUrl, '_blank')}
            showInMenu={false}
          />
        </Tooltip>
      ]
    }
  ];

  const formatTimeTaken = (timeTaken?: Survey['timeTaken']) => {
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

  const formatModifyDate = (dateStr: string) => {
    // Parse the date and format like the original: "Jan 15, 2024 14:30:22"
    try {
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
    return filteredSurveys.reduce((totals, survey) => ({
      started: totals.started + survey.started,
      completed: totals.completed + survey.completed,
      partial: totals.partial + survey.partial,
      disqualified: totals.disqualified + survey.disqualified,
    }), { started: 0, completed: 0, partial: 0, disqualified: 0 });
  };

  const totals = calculateTotals();

  // Column management handlers
  const handleColumnToggle = (field: string) => {
    setColumnVisibilityModel(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const handleShowAllColumns = () => {
    setColumnVisibilityModel({
      opinionId: true,
      preview: true,
      name: true,
      started: true,
      completed: true,
      completionRate: true,
      partial: true,
      disqualified: true,
      timeTaken: true,
      modifyDate: true,
      cntControls: true,
      actions: true,
    });
    setColumnMenuAnchor(null);
  };

  const handleHideAllColumns = () => {
    setColumnVisibilityModel({
      opinionId: true, // Keep ID always visible
      preview: false,
      name: true, // Keep name always visible
      started: false,
      completed: false,
      completionRate: false,
      partial: false,
      disqualified: false,
      timeTaken: false,
      modifyDate: false,
      cntControls: false,
      actions: true, // Keep actions always visible
    });
    setColumnMenuAnchor(null);
  };

  // Column display names for the menu
  const columnDisplayNames = {
    opinionId: '# (Survey ID)',
    preview: 'Preview',
    name: 'Name',
    started: 'Responses',
    completed: 'Completed',
    completionRate: 'Completion Rate',
    partial: 'Partial',
    disqualified: 'Disqualified',
    timeTaken: 'Avg. Time Taken',
    modifyDate: 'Modify Date',
    cntControls: 'Questions',
    actions: 'Actions',
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setActionMenuAnchor(null);
  };

  const handleCopyClick = () => {
    if (selectedSurveys.length > 0) {
      const survey = surveys.find(s => s.opinionId === selectedSurveys[0]);
      if (survey) {
        setCopySurveyName(survey.name);
      }
    }
    setCopyDialogOpen(true);
    setActionMenuAnchor(null);
  };

  const handleExportClick = (format: 'excel' | 'csv') => {
    setExportFormat(format);
    if (selectedSurveys.length > 0) {
      const survey = surveys.find(s => s.opinionId === selectedSurveys[0]);
      if (survey) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') + '_' + 
                       now.toTimeString().slice(0, 5).replace(':', '');
        setExportFilename(`Results_${survey.opinionId}_${dateStr}`);
      }
    }
    setExportDialogOpen(true);
    setActionMenuAnchor(null);
  };

  const handleDelete = async () => {
    // TODO: Implement delete functionality
    console.log('Deleting surveys:', selectedSurveys);
    setSuccess(`${selectedSurveys.length} survey(s) deleted successfully`);
    setDeleteDialogOpen(false);
    setSelectedSurveys([]);
    // Reload surveys
    loadSurveys();
  };

  const handleCopy = async () => {
    // TODO: Implement copy functionality
    console.log('Copying survey to account:', copyToAccountId, 'with name:', copySurveyName);
    setSuccess('Survey copied successfully');
    setCopyDialogOpen(false);
    setCopyToAccountId('');
    setCopySurveyName('');
    setSelectedSurveys([]);
  };

  const handleExport = async () => {
    // TODO: Implement export functionality
    console.log('Exporting survey as:', exportFormat, 'with filename:', exportFilename);
    setSuccess(`Survey exported as ${exportFormat.toUpperCase()}`);
    setExportDialogOpen(false);
    setExportFilename('');
    setSelectedSurveys([]);
  };

  if (loading) {
    return <Typography>Loading surveys...</Typography>;
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


      {/* Action buttons - Temporarily hidden while selection is disabled */}
      {false && selectedSurveys.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            color="error"
          >
            Delete ({selectedSurveys.length})
          </Button>
          
          {selectedSurveys.length === 1 && (
            <>
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopyClick}
              >
                Copy to another account
              </Button>
              
              <ButtonGroup variant="outlined">
                <Button
                  startIcon={<ExportIcon />}
                  onClick={(e) => setActionMenuAnchor(e.currentTarget)}
                >
                  Export results
                </Button>
              </ButtonGroup>
            </>
          )}
          
          <Menu
            anchorEl={actionMenuAnchor}
            open={Boolean(actionMenuAnchor)}
            onClose={() => setActionMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleExportClick('excel')}>Excel (*.XLSX)</MenuItem>
            <MenuItem onClick={() => handleExportClick('csv')}>CSV</MenuItem>
          </Menu>
        </Box>
      )}

      {/* Toolbar */}
      <StyledDataGridToolbar>
        <TextField
          size="small"
          placeholder="Search surveys..."
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
        <Button
          variant="outlined"
          startIcon={<ViewColumnIcon />}
          onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
          sx={{ ml: 'auto' }}
        >
          Manage Columns
        </Button>
      </StyledDataGridToolbar>

      {/* Surveys DataGrid */}
      <Paper sx={{ p: 0 }}>
        <StyledDataGrid
          rows={filteredSurveys}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25, 50, 100]}
          getRowId={(row) => row.opinionId}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          autoHeight
        />
      </Paper>


      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Deleting surveys</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete selected surveys?</Typography>
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

      {/* Copy Survey Dialog */}
      <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Copying survey to another account</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter a name you'll use to reference this survey.
            </Typography>
            <TextField
              fullWidth
              label="Survey Name"
              value={copySurveyName}
              onChange={(e) => setCopySurveyName(e.target.value)}
              inputProps={{ maxLength: 100 }}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ mb: 1 }}>
              Account Id
            </Typography>
            <TextField
              fullWidth
              label="Account ID"
              value={copyToAccountId}
              onChange={(e) => setCopyToAccountId(e.target.value)}
              inputProps={{ maxLength: 100 }}
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCopy} 
            color="primary" 
            variant="contained"
            disabled={!copySurveyName.trim() || !copyToAccountId.trim()}
          >
            Copy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export results</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter a filename.
            </Typography>
            <TextField
              fullWidth
              label="Filename"
              value={exportFilename}
              onChange={(e) => setExportFilename(e.target.value)}
              inputProps={{ maxLength: 100 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            color="primary" 
            variant="contained"
            disabled={!exportFilename.trim()}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Column Management Menu */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
        PaperProps={{
          sx: { minWidth: 250, maxHeight: 400 }
        }}
      >
        <MenuItem onClick={handleShowAllColumns} sx={{ fontWeight: 'bold' }}>
          Show All Columns
        </MenuItem>
        <MenuItem onClick={handleHideAllColumns} sx={{ fontWeight: 'bold' }}>
          Hide All Columns
        </MenuItem>
        <Divider />
        {Object.entries(columnDisplayNames).map(([field, displayName]) => {
          // Prevent hiding essential columns
          const isEssential = field === 'opinionId' || field === 'name' || field === 'actions';
          return (
            <MenuItem key={field} sx={{ py: 0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={columnVisibilityModel[field as keyof typeof columnVisibilityModel]}
                    onChange={() => !isEssential && handleColumnToggle(field)}
                    disabled={isEssential}
                  />
                }
                label={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isEssential ? 'text.secondary' : 'text.primary',
                      fontStyle: isEssential ? 'italic' : 'normal'
                    }}
                  >
                    {displayName} {isEssential && '(required)'}
                  </Typography>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </MenuItem>
          );
        })}
      </Menu>

    </Box>
  );
};

export default SurveysTab;
