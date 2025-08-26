import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Grid,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Launch as LaunchIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { Collector, Account, ApiResponse } from '../../types';
import { opinionApiService as ApiService } from '../../services';
import { useSetBreadcrumbs } from '../../contexts/BreadcrumbContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collector-tabpanel-${index}`}
      aria-labelledby={`collector-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountCollectorDetailsPage: React.FC = () => {
  const { accountId, collectorId } = useParams<{ accountId: string; collectorId: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbData } = useSetBreadcrumbs();
  
  const [collector, setCollector] = useState<Collector | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (accountId && collectorId) {
      loadData();
    }
  }, [accountId, collectorId]);

  // Set breadcrumb data when collector and account are loaded
  useEffect(() => {
    if (collector && account) {
      setBreadcrumbData({
        accountName: account.accountName,
        collectorName: collector.name
      });
    }
  }, [collector, account, setBreadcrumbData]);

  // Cleanup breadcrumbs on unmount
  useEffect(() => {
    return () => {
      setBreadcrumbData({});
    };
  }, [setBreadcrumbData]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accountIdNum = parseInt(accountId!);
      const collectorIdNum = parseInt(collectorId!);
      
      if (isNaN(accountIdNum) || isNaN(collectorIdNum)) {
        throw new Error('Invalid account ID or collector ID');
      }

      // Load account details and collectors
      const [accountResponse, collectorsResponse] = await Promise.all([
        ApiService.getAccount(accountIdNum),
        ApiService.getCollectorsByAccount(accountIdNum)
      ]);
      
      if (accountResponse.success && accountResponse.data) {
        setAccount(accountResponse.data);
      } else {
        setError('Failed to load account details');
        return;
      }

      if (collectorsResponse.success && collectorsResponse.data) {
        const foundCollector = collectorsResponse.data.list.find(c => c.collectorId === collectorIdNum);
        if (foundCollector) {
          setCollector(foundCollector);
        } else {
          setError('Collector not found in this account');
        }
      } else {
        setError('Failed to load collector details');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const getCollectorType = (typeId: number): string => {
    switch (typeId) {
      case 1:
        return "Direct link";
      case 2:
        return "CINT panel";
      default:
        return "Unknown";
    }
  };

  const getCollectorStatus = (statusId: number, typeId: number): string => {
    switch (statusId) {
      case 1:
        return typeId === 1 ? "Open" : "The panel is live";
      case 2:
        return typeId === 1 ? "Closed" : "Panel has been completed";
      case 3:
        return "Awaiting payment";
      case 4:
        return "Panel is being verified";
      case 5:
        return "The panel is live";
      case 6:
        return "Panel has been completed";
      case 7:
        return "Pending";
      case 8:
        return "Canceled";
      default:
        return "Unknown";
    }
  };

  const getStatusChip = (statusId: number, typeId: number) => {
    const status = getCollectorStatus(statusId, typeId);
    let color: "success" | "error" | "warning" | "info" | "default" = "default";

    switch (statusId) {
      case 1:
      case 5:
        color = "success";
        break;
      case 2:
      case 6:
        color = "info";
        break;
      case 3:
      case 4:
      case 7:
        color = "warning";
        break;
      case 8:
        color = "error";
        break;
    }

    return <Chip label={status} color={color} size="small" />;
  };

  const calculateCompletionRate = (completed: number, started: number): string => {
    if (started === 0) return "0.00%";
    return ((completed / started) * 100).toFixed(2) + "%";
  };

  const formatTimeTaken = (timeTaken?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }): string => {
    if (!timeTaken) return "--";

    const { days, hours, minutes, seconds } = timeTaken;

    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      return "Less than sec";
    }

    let result = "";
    if (days > 0) result += `${days} ${days > 1 ? "days" : "day"}, `;
    if (hours > 0) result += `${hours} ${hours > 1 ? "hours" : "hour"}, `;
    if (minutes > 0) result += `${minutes} ${minutes > 1 ? "mins" : "min"}, `;
    if (seconds > 0) result += `${seconds} ${seconds > 1 ? "secs" : "sec"}`;

    return result.replace(/, $/, "");
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading collector details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/accounts/${accountId}?tab=collectors`)}
        >
          Back to Account Collectors
        </Button>
      </Box>
    );
  }

  if (!collector || !account) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Collector or account not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/accounts/${accountId}?tab=collectors`)}
        >
          Back to Account Collectors
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/accounts/${accountId}?tab=collectors`)}
        >
          Back to Account Collectors
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {collector.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AssessmentIcon />}
          onClick={() => navigate(`/accounts/${accountId}?tab=surveys`)}
        >
          View Survey
        </Button>
      </Box>

      {/* Account Context */}
      <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="subtitle1" color="text.secondary">
            Collector in Account: <strong>{account.accountName}</strong> (ID: {account.accountId})
          </Typography>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="collector tabs">
          <Tab label="Overview" id="collector-tab-0" />
          <Tab label="Analytics" id="collector-tab-1" />
          <Tab label="Settings" id="collector-tab-2" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Collector Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Collector ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      #{collector.collectorId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1">
                      {getCollectorType(collector.sourceTypeId)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {getStatusChip(collector.statusId, collector.sourceTypeId)}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Survey
                    </Typography>
                    <Typography 
                      variant="body1"
                      component="button"
                      onClick={() => navigate(`/accounts/${accountId}?tab=surveys`)}
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        p: 0,
                        font: 'inherit'
                      }}
                      title={`[${collector.opinionTypeName}] ${collector.opinionName}`}
                    >
                      {collector.opinionName}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistics */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Response Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Responses
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {collector.started.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {collector.completed.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Partial
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {collector.partial.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                    <Typography variant="h6" color="info.main">
                      {calculateCompletionRate(collector.completed, collector.started)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Time
                    </Typography>
                    <Typography variant="h6">
                      {formatTimeTaken(collector.timeTaken)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Analytics features would be implemented here, showing detailed response data, 
              trends, and performance metrics for this collector.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Collector Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Collector configuration and settings would be available here, including 
              URL management, status controls, and collection parameters.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default AccountCollectorDetailsPage;
