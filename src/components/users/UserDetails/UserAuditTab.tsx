import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  TablePagination,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { format } from 'date-fns';
import { Refresh, ExpandMore, Download } from '@mui/icons-material';
import { opinionApiService } from '../../../services';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    type: 'user' | 'admin' | 'system';
  };
  action: string;
  target: {
    type: string;
    id: string;
    name?: string;
  };
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  severity: 'info' | 'warning' | 'error';
}

interface UserAuditTabProps {
  userId: string;
}

const UserAuditTab: React.FC<UserAuditTabProps> = ({ userId }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const severityOptions = ['info', 'warning', 'error'];
  const actionOptions = [
    'user.login', 'user.logout', 'user.updated', 'user.deleted',
    'password.changed', 'mfa.enabled', 'mfa.disabled',
    'session.created', 'session.revoked',
    'permissions.updated'
  ];

  useEffect(() => {
    loadAuditLogs();
  }, [userId, page, rowsPerPage, actionFilter, severityFilter, dateFromFilter, dateToFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await opinionApiService.getUserAuditLogs(parseInt(userId), {
        page: page + 1,
        limit: rowsPerPage,
        action: actionFilter || undefined,
        severity: severityFilter || undefined,
        fromDate: dateFromFilter || undefined,
        toDate: dateToFilter || undefined,
      });
      // Handle paginated response structure
      if (response.success && response.data) {
        const auditLogs = Array.isArray(response.data) ? response.data : (response.data.list || response.data.items || []);
        setAuditLogs(auditLogs);
        setTotalCount(response.data.total || response.data.totalCount || auditLogs.length);
      } else {
        setAuditLogs([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setActionFilter('');
    setSeverityFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setPage(0);
  };

  const handleExportLogs = async () => {
    try {
      // TODO: Implement export functionality when API is available
      console.log('Export audit logs functionality not yet implemented');
      alert('Export functionality is not yet implemented');
    } catch (err: any) {
      console.error('Failed to export audit logs:', err);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return 'Invalid date';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getActorColor = (type: string) => {
    switch (type) {
      case 'admin': return 'error';
      case 'user': return 'primary';
      case 'system': return 'secondary';
      default: return 'default';
    }
  };

  const handleRowExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Audit Log</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportLogs}
            size="small"
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadAuditLogs}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <MenuItem value="">All Actions</MenuItem>
                  {actionOptions.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  label="Severity"
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <MenuItem value="">All Severities</MenuItem>
                  {severityOptions.map((severity) => (
                    <MenuItem key={severity} value={severity}>
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="From Date"
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="To Date"
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                size="small"
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : auditLogs.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                No audit log entries found for this user.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Actor</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell align="center">Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <React.Fragment key={log.id}>
                        <TableRow hover>
                          <TableCell>
                            <Typography variant="body2">
                              {formatTimestamp(log.timestamp)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Chip
                                label={log.actor.name}
                                size="small"
                                color={getActorColor(log.actor.type)}
                                variant="outlined"
                              />
                              <Typography variant="caption" display="block" color="text.secondary">
                                {log.actor.type}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {log.action}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {log.target.type}
                              </Typography>
                              {log.target.name && (
                                <Typography variant="caption" color="text.secondary">
                                  {log.target.name}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={log.severity}
                              size="small"
                              color={getSeverityColor(log.severity)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {log.ipAddress || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              onClick={() => handleRowExpand(log.id)}
                              startIcon={<ExpandMore />}
                            >
                              {expandedRow === log.id ? 'Less' : 'More'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedRow === log.id && (
                          <TableRow>
                            <TableCell colSpan={7}>
                              <Box p={2}>
                                <Grid container spacing={2}>
                                  {log.correlationId && (
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="body2" color="text.secondary">
                                        Correlation ID:
                                      </Typography>
                                      <Typography variant="body2" fontFamily="monospace">
                                        {log.correlationId}
                                      </Typography>
                                    </Grid>
                                  )}
                                  {log.userAgent && (
                                    <Grid item xs={12}>
                                      <Typography variant="body2" color="text.secondary">
                                        User Agent:
                                      </Typography>
                                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                        {log.userAgent}
                                      </Typography>
                                    </Grid>
                                  )}
                                  <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                      Metadata:
                                    </Typography>
                                    <Box component="pre" sx={{ 
                                      fontSize: '0.75rem', 
                                      fontFamily: 'monospace',
                                      backgroundColor: 'grey.100',
                                      p: 1,
                                      borderRadius: 1,
                                      overflow: 'auto',
                                      whiteSpace: 'pre-wrap'
                                    }}>
                                      {JSON.stringify(log.metadata, null, 2)}
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserAuditTab;
