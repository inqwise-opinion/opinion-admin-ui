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
  Preview as PreviewIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { Account, ApiResponse } from '../../types';
import { opinionApiService as ApiService } from '../../services';
import { useSetBreadcrumbs } from '../../contexts/BreadcrumbContext';

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
  accountId?: number;
  accountName?: string;
}

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
      id={`survey-tabpanel-${index}`}
      aria-labelledby={`survey-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountSurveyDetailsPage: React.FC = () => {
  const { accountId, surveyId } = useParams<{ accountId: string; surveyId: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbData } = useSetBreadcrumbs();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (accountId && surveyId) {
      loadData();
    }
  }, [accountId, surveyId]);

  // Set breadcrumb data when survey and account are loaded
  useEffect(() => {
    if (survey && account) {
      setBreadcrumbData({
        accountName: account.accountName,
        surveyName: survey.name
      });
    }
  }, [survey, account, setBreadcrumbData]);

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
      const surveyIdNum = parseInt(surveyId!);
      
      if (isNaN(accountIdNum) || isNaN(surveyIdNum)) {
        throw new Error('Invalid account ID or survey ID');
      }

      // Load account details and surveys
      const [accountResponse, surveysResponse] = await Promise.all([
        ApiService.getAccount(accountIdNum),
        ApiService.getOpinionsList(accountIdNum, 1) // 1 for surveys
      ]);
      
      if (accountResponse.success && accountResponse.data) {
        setAccount(accountResponse.data);
      } else {
        setError('Failed to load account details');
        return;
      }

      if (surveysResponse.success && surveysResponse.data) {
        const foundSurvey = surveysResponse.data.list.find((s: Survey) => s.opinionId === surveyIdNum);
        if (foundSurvey) {
          // Add account information to the survey
          setSurvey({
            ...foundSurvey,
            accountId: accountIdNum,
            accountName: accountResponse.data.accountName
          });
        } else {
          setError('Survey not found in this account');
        }
      } else {
        setError('Failed to load survey details');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
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

  const formatModifyDate = (dateStr: string) => {
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading survey details...</Typography>
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
          onClick={() => navigate(`/accounts/${accountId}?tab=surveys`)}
        >
          Back to Account Surveys
        </Button>
      </Box>
    );
  }

  if (!survey || !account) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Survey not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/accounts/${accountId}?tab=surveys`)}
        >
          Back to Account Surveys
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
          onClick={() => navigate(`/accounts/${accountId}?tab=surveys`)}
        >
          Back to Account
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {survey.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PreviewIcon />}
          onClick={() => window.open(survey.previewUrl, '_blank')}
          sx={{ mr: 1 }}
        >
          Preview Survey
        </Button>
        <Button
          variant="outlined"
          startIcon={<BusinessIcon />}
          onClick={() => navigate(`/accounts/${accountId}`)}
        >
          View Account
        </Button>
      </Box>

      {/* Account context info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Account Context:</strong> {account.accountName} (ID: {account.accountId})
          {account.isActive ? ' • Status: Active' : ' • Status: Inactive'}
        </Typography>
      </Alert>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="survey tabs">
          <Tab label="Overview" id="survey-tab-0" aria-controls="survey-tabpanel-0" />
          <Tab label="Statistics" id="survey-tab-1" aria-controls="survey-tabpanel-1" />
          <Tab label="Settings" id="survey-tab-2" aria-controls="survey-tabpanel-2" />
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
                  Survey Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Survey ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      #{survey.opinionId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Questions
                    </Typography>
                    <Typography variant="body1">
                      {survey.cntControls}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Account
                    </Typography>
                    <Typography 
                      variant="body1"
                      component="button"
                      onClick={() => navigate(`/accounts/${survey.accountId}`)}
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        p: 0,
                        font: 'inherit'
                      }}
                    >
                      {survey.accountName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Modified
                    </Typography>
                    <Typography variant="body1">
                      {formatModifyDate(survey.modifyDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Responses
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {survey.started.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {survey.completed.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                    <Typography variant="h6" color="info.main">
                      {calculateCompletionRate(survey.completed, survey.started)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {/* Detailed Statistics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detailed Response Statistics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Responses
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {survey.started.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {survey.completed.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Partial
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {survey.partial.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Disqualified
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {survey.disqualified.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {calculateCompletionRate(survey.completed, survey.started)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Average Time Taken
                    </Typography>
                    <Typography variant="h4">
                      {formatTimeTaken(survey.timeTaken)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Survey Actions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Manage your survey settings and access additional features.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    <Button
                      variant="contained"
                      startIcon={<PreviewIcon />}
                      onClick={() => window.open(survey.previewUrl, '_blank')}
                    >
                      Preview Survey
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      startIcon={<BusinessIcon />}
                      onClick={() => navigate(`/surveys/${survey.opinionId}`)}
                    >
                      View Global Details
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      startIcon={<AnalyticsIcon />}
                      disabled
                    >
                      Advanced Analytics
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default AccountSurveyDetailsPage;
