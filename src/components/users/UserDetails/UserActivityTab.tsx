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
} from '@mui/material';
import { format } from 'date-fns';
import { opinionApiService } from '../../../services';

interface ActivityEvent {
  id: string;
  timestamp: string;
  event: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
  severity: 'info' | 'warning' | 'error';
}

interface UserActivityTabProps {
  userId: string;
}

const UserActivityTab: React.FC<UserActivityTabProps> = ({ userId }) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadActivities();
  }, [userId, page, rowsPerPage]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await opinionApiService.getUserActivity(parseInt(userId), {
        page: page + 1,
        limit: rowsPerPage
      });
      // Handle paginated response structure
      if (response.success && response.data) {
        const activities = Array.isArray(response.data) ? response.data : (response.data.list || response.data.items || []);
        setActivities(activities);
        setTotalCount(response.data.total || response.data.totalCount || activities.length);
      } else {
        setActivities([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error('Failed to load user activity:', err);
      setError(err.message || 'Failed to load user activity');
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

  const getClientInfo = (userAgent: string) => {
    // Simple user agent parsing - in a real app you might use a library
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
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
        <Typography variant="h6">Activity History</Typography>
        <Button variant="outlined" onClick={loadActivities} disabled={loading}>
          Refresh
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : activities.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                No recent activity found for this user.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Event</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {formatTimestamp(activity.timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={activity.event}
                              size="small"
                              color={getSeverityColor(activity.severity)}
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {activity.ipAddress}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getClientInfo(activity.userAgent)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ maxWidth: 200 }}
                            noWrap
                            title={activity.details}
                          >
                            {activity.details || 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
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
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserActivityTab;
