import React, { useState, useEffect, useCallback } from 'react';
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
  TableFooter,
  Checkbox,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Link as MuiLink,
  Pagination,
  LinearProgress,
  Tooltip,
  Menu,
  MenuList,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  FileDownload as ExportIcon,
  Preview as PreviewIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { Survey } from '../types';
import opinionApiService from '../services';

const SurveysPage: React.FC = () => {
  // State management
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurveys, setSelectedSurveys] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(25);
  
  // Action dialogs state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  // Copy dialog state
  const [copyData, setCopyData] = useState({
    surveyName: '',
    accountId: ''
  });
  const [copyErrors, setCopyErrors] = useState<{ [key: string]: string }>({});
  
  // Export dialog state
  const [exportData, setExportData] = useState({
    filename: '',
    format: 'excel' as 'excel' | 'csv'
  });
  const [exportErrors, setExportErrors] = useState<{ [key: string]: string }>({});

  // Load surveys on mount
  const loadSurveys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await opinionApiService.getSurveys({ top: 100 });
      if (response.success && response.data?.list) {
        setSurveys(response.data.list);
      } else {
        throw new Error('Failed to load surveys');
      }
    } catch (err: any) {
      console.error('Error loading surveys:', err);
      setError(err.message || 'Failed to load surveys');
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  // Filter surveys based on search term
  const filteredSurveys = surveys.filter(survey =>
    survey.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.accountName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated surveys
  const paginatedSurveys = filteredSurveys.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredSurveys.length / rowsPerPage);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSurveys(new Set(paginatedSurveys.map(s => s.opinionId)));
    } else {
      setSelectedSurveys(new Set());
    }
  };

  const handleSelectSurvey = (opinionId: number, checked: boolean) => {
    const newSelected = new Set(selectedSurveys);
    if (checked) {
      newSelected.add(opinionId);
    } else {
      newSelected.delete(opinionId);
    }
    setSelectedSurveys(newSelected);
  };

  // Format time taken
  const formatTimeTaken = (timeTaken?: { days: number; hours: number; minutes: number; seconds: number }) => {
    if (!timeTaken) return '--';
    
    const { days, hours, minutes, seconds } = timeTaken;
    
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      return 'Less than sec';
    }
    
    let result = '';
    if (days > 0) result += `${days} ${days > 1 ? 'days' : 'day'}, `;
    if (hours > 0) result += `${hours} ${hours > 1 ? 'hours' : 'hour'}, `;
    if (minutes > 0) result += `${minutes} ${minutes > 1 ? 'mins' : 'min'}, `;
    if (seconds > 0) result += `${seconds} ${seconds > 1 ? 'secs' : 'sec'}`;
    
    return result.replace(/, $/, ''); // Remove trailing comma
  };

  // Format completion rate
  const formatCompletionRate = (started: number, completed: number) => {
    if (started === 0) return '0.00%';
    return ((completed / started) * 100).toFixed(2) + '%';
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Action handlers
  const handleDeleteSurveys = async () => {
    try {
      const selectedIds = Array.from(selectedSurveys);
      await opinionApiService.deleteSurveys(selectedIds);
      
      // Refresh surveys list
      await loadSurveys();
      setSelectedSurveys(new Set());
      setDeleteDialogOpen(false);
    } catch (err: any) {
      console.error('Error deleting surveys:', err);
      setError(err.message || 'Failed to delete surveys');
    }
  };

  const handleCopySurvey = async () => {
    // Clear previous errors
    setCopyErrors({});
    
    // Validation
    const errors: { [key: string]: string } = {};
    if (!copyData.surveyName || copyData.surveyName.trim().length < 3) {
      errors.surveyName = 'Survey name must be at least 3 characters';
    }
    if (copyData.surveyName.length > 100) {
      errors.surveyName = 'Survey name cannot exceed 100 characters';
    }
    if (!copyData.accountId || isNaN(parseInt(copyData.accountId))) {
      errors.accountId = 'Please enter a valid account ID';
    }
    
    if (Object.keys(errors).length > 0) {
      setCopyErrors(errors);
      return;
    }

    try {
      const selectedIds = Array.from(selectedSurveys);
      if (selectedIds.length > 0) {
        const opinionId = selectedIds[0]; // Copy the first selected survey
        await opinionApiService.copySurvey(
          opinionId,
          copyData.surveyName.trim(),
          parseInt(copyData.accountId)
        );
        
        // Refresh surveys list
        await loadSurveys();
        setSelectedSurveys(new Set());
        setCopyDialogOpen(false);
        setCopyData({ surveyName: '', accountId: '' });
      }
    } catch (err: any) {
      console.error('Error copying survey:', err);
      setError(err.message || 'Failed to copy survey');
    }
  };

  const handleExportSurvey = async () => {
    // Clear previous errors
    setExportErrors({});
    
    // Validation
    const errors: { [key: string]: string } = {};
    if (!exportData.filename || exportData.filename.trim().length < 3) {
      errors.filename = 'Filename must be at least 3 characters';
    }
    if (exportData.filename.length > 100) {
      errors.filename = 'Filename cannot exceed 100 characters';
    }
    
    if (Object.keys(errors).length > 0) {
      setExportErrors(errors);
      return;
    }

    try {
      const selectedIds = Array.from(selectedSurveys);
      if (selectedIds.length > 0) {
        const opinionId = selectedIds[0]; // Export the first selected survey
        await opinionApiService.exportSurveyResults(
          opinionId,
          exportData.format,
          exportData.filename.trim()
        );
        
        setSelectedSurveys(new Set());
        setExportDialogOpen(false);
        setExportData({ filename: '', format: 'excel' });
      }
    } catch (err: any) {
      console.error('Error exporting survey:', err);
      setError(err.message || 'Failed to export survey results');
    }
  };

  // Dialog setup handlers
  const openCopyDialog = () => {
    const selectedIds = Array.from(selectedSurveys);
    if (selectedIds.length > 0) {
      const survey = surveys.find(s => s.opinionId === selectedIds[0]);
      setCopyData({
        surveyName: survey?.name || '',
        accountId: ''
      });
      setCopyDialogOpen(true);
    }
    setActionAnchorEl(null);
  };

  const openExportDialog = () => {
    const selectedIds = Array.from(selectedSurveys);
    if (selectedIds.length > 0) {
      const survey = surveys.find(s => s.opinionId === selectedIds[0]);
      const now = new Date();
      const defaultFilename = `Results_${selectedIds[0]}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      
      setExportData({
        filename: defaultFilename,
        format: 'excel'
      });
      setExportDialogOpen(true);
    }
    setExportAnchorEl(null);
  };

  // Calculate totals for footer
  const totals = {
    totalSurveys: filteredSurveys.length,
    totalStarted: filteredSurveys.reduce((sum, survey) => sum + survey.started, 0),
    totalCompleted: filteredSurveys.reduce((sum, survey) => sum + survey.completed, 0),
    totalPartial: filteredSurveys.reduce((sum, survey) => sum + survey.partial, 0)
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Surveys
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              disabled={selectedSurveys.size === 0}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ color: selectedSurveys.size === 0 ? '#999' : '#333' }}
            >
              Delete
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<MoreIcon />}
              disabled={selectedSurveys.size === 0}
              onClick={(e) => setActionAnchorEl(e.currentTarget)}
              endIcon={<MoreIcon />}
              sx={{ color: selectedSurveys.size === 0 ? '#999' : '#333' }}
            >
              More actions
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              disabled={selectedSurveys.size === 0}
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
              endIcon={<MoreIcon />}
              sx={{ color: selectedSurveys.size === 0 ? '#999' : '#333' }}
            >
              <ExportIcon /> Export results
            </Button>
          </Box>

          {/* Search */}
          <TextField
            size="small"
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        </Box>

        {/* Data table */}
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    disabled={paginatedSurveys.length === 0}
                    checked={paginatedSurveys.length > 0 && selectedSurveys.size === paginatedSurveys.length}
                    indeterminate={selectedSurveys.size > 0 && selectedSurveys.size < paginatedSurveys.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell align="right" sx={{ width: '46px' }}>#</TableCell>
                <TableCell sx={{ width: '12px' }}></TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Responses</TableCell>
                <TableCell align="right">Completed</TableCell>
                <TableCell align="right">Completion Rate</TableCell>
                <TableCell align="right">Partial</TableCell>
                <TableCell align="right">Disqualified</TableCell>
                <TableCell align="right">Avg. Time Taken</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Modify Date</TableCell>
                <TableCell align="right">Questions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSurveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 4, color: '#666' }}>
                    {loading ? 'Loading surveys...' : 'No records found.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSurveys.map((survey) => (
                  <TableRow 
                    key={survey.opinionId}
                    hover
                    selected={selectedSurveys.has(survey.opinionId)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedSurveys.has(survey.opinionId)}
                        onChange={(e) => handleSelectSurvey(survey.opinionId, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell align="right">{survey.opinionId}</TableCell>
                    <TableCell>
                      <Tooltip title="Preview">
                        <IconButton
                          size="small"
                          onClick={() => window.open(survey.previewUrl, '_blank')}
                        >
                          <PreviewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {survey.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatNumber(survey.started)}</TableCell>
                    <TableCell align="right">{formatNumber(survey.completed)}</TableCell>
                    <TableCell align="right">
                      {formatCompletionRate(survey.started, survey.completed)}
                    </TableCell>
                    <TableCell align="right">{formatNumber(survey.partial)}</TableCell>
                    <TableCell align="right">{formatNumber(survey.disqualified || 0)}</TableCell>
                    <TableCell align="right">{formatTimeTaken(survey.timeTaken)}</TableCell>
                    <TableCell>
                      <MuiLink
                        component="button"
                        variant="body2"
                        onClick={() => {
                          // Navigate to account surveys page
                          window.location.href = `/accounts/${survey.accountId}?tab=surveys`;
                        }}
                        sx={{ textAlign: 'left' }}
                      >
                        {survey.accountName}
                      </MuiLink>
                    </TableCell>
                    <TableCell>
                      {survey.modifyDate ? new Date(survey.modifyDate).toLocaleDateString() : '--'}
                    </TableCell>
                    <TableCell align="right">{survey.cntControls || '--'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                <TableCell />
                <TableCell align="right" />
                <TableCell />
                <TableCell sx={{ fontWeight: 'bold' }}>Total - all surveys</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(totals.totalStarted)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(totals.totalCompleted)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {formatCompletionRate(totals.totalStarted, totals.totalCompleted)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(totals.totalPartial)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>0</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>--</TableCell>
                <TableCell />
                <TableCell />
                <TableCell align="right" />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: 2,
          borderTop: '1px solid #e0e0e0'
        }}>
          <Typography variant="body2">
            <strong>{(currentPage - 1) * rowsPerPage + 1}</strong> - <strong>{Math.min(currentPage * rowsPerPage, filteredSurveys.length)}</strong> of <strong>{filteredSurveys.length}</strong>
          </Typography>
          
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={() => setActionAnchorEl(null)}
      >
        <MenuList>
          <MenuItem onClick={openCopyDialog}>
            <CopyIcon fontSize="small" sx={{ mr: 2 }} />
            <ListItemText>Copy to another account</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Export Menu */}
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={() => setExportAnchorEl(null)}
      >
        <MenuList>
          <MenuItem onClick={() => {
            setExportData(prev => ({ ...prev, format: 'excel' }));
            openExportDialog();
          }}>
            <ExportIcon fontSize="small" sx={{ mr: 2 }} />
            <ListItemText>Excel (*.XLSX)</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            setExportData(prev => ({ ...prev, format: 'csv' }));
            openExportDialog();
          }}>
            <ExportIcon fontSize="small" sx={{ mr: 2 }} />
            <ListItemText>CSV</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Deleting surveys</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedSurveys.size} selected survey{selectedSurveys.size !== 1 ? 's' : ''}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteSurveys} color="primary" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Survey Dialog */}
      <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Copying survey to another account</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Enter a name you'll use to reference this survey.
            </Typography>
            <TextField
              fullWidth
              value={copyData.surveyName}
              onChange={(e) => setCopyData(prev => ({ ...prev, surveyName: e.target.value }))}
              error={!!copyErrors.surveyName}
              helperText={copyErrors.surveyName}
              inputProps={{ maxLength: 100 }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Account Id
            </Typography>
            <TextField
              fullWidth
              value={copyData.accountId}
              onChange={(e) => setCopyData(prev => ({ ...prev, accountId: e.target.value }))}
              error={!!copyErrors.accountId}
              helperText={copyErrors.accountId}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCopySurvey} color="primary" variant="contained">
            Copy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Results Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export results</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Enter a filename.
            </Typography>
            <TextField
              fullWidth
              value={exportData.filename}
              onChange={(e) => setExportData(prev => ({ ...prev, filename: e.target.value }))}
              error={!!exportErrors.filename}
              helperText={exportErrors.filename}
              inputProps={{ maxLength: 100 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleExportSurvey} color="primary" variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SurveysPage;
