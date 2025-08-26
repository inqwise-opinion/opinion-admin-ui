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
  Divider,
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
  Preview as PreviewIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
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

const SurveyDetailsPage: React.FC = () => {
  const { id: surveyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbData } = useSetBreadcrumbs();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (surveyId) {
      loadSurveyDetails();
    }
  }, [surveyId]);

  // Set breadcrumb data when survey is loaded
  useEffect(() => {
    if (survey) {
      setBreadcrumbData({
        surveyName: survey.name,
        accountName: survey.accountName
      });
    }
  }, [survey, setBreadcrumbData]);

  // Cleanup breadcrumbs on unmount
  useEffect(() => {
    return () => {
      setBreadcrumbData({});
    };
  }, [setBreadcrumbData]);

  const loadSurveyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const surveyIdNum = parseInt(surveyId!);
      if (isNaN(surveyIdNum)) {
        throw new Error('Invalid survey ID');
      }

      // For now, we'll search for the survey across all accounts
      // In a real implementation, there would be a specific getSurvey endpoint
      // We'll try to find it by searching through accounts or getting global opinion list
      
      try {
        // First, try to get from global surveys if available
        const response = await ApiService.getOpinionsList(0, 1); // 0 for all accounts, 1 for surveys
        
        if (response.success && response.data) {
          const foundSurvey = response.data.list.find((s: Survey) => s.opinionId === surveyIdNum);
          if (foundSurvey) {
            setSurvey(foundSurvey);
          } else {
            setError('Survey not found');
          }
        } else {
          setError('Failed to load survey details');
        }
      } catch (apiError) {
        // If the global search fails, we might need to search through individual accounts
        console.error('Failed to get global surveys, could search individual accounts as fallback');
        setError('Survey not found or access denied');
      }
    } catch (err) {
      console.error('Error loading survey details:', err);
      setError('An error occurred while loading survey details');
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
          onClick={() => navigate('/surveys')}
        >
          Back to Surveys
        </Button>
      </Box>
    );
  }

  if (!survey) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Survey not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/surveys')}
        >
          Back to Surveys
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
          onClick={() => navigate('/surveys')}
        >
          Back to Surveys
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
        {survey.accountId && (
          <Button
            variant="outlined"
            startIcon={<BusinessIcon />}
            onClick={() => navigate(`/accounts/${survey.accountId}`)}
          >
            View Account
          </Button>
        )}
      </Box>

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
                {survey.accountId && survey.accountName && (
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
                )}
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
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Partial
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {survey.partial.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {calculateCompletionRate(survey.completed, survey.started)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Disqualified
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {survey.disqualified.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Time
                  </Typography>
                  <Typography variant="h6">
                    {formatTimeTaken(survey.timeTaken)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview and Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Survey Actions
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
                {survey.accountId && (
                  <Grid item>
                    <Button
                      variant="outlined"
                      startIcon={<BusinessIcon />}
                      onClick={() => navigate(`/accounts/${survey.accountId}?tab=surveys`)}
                    >
                      View in Account Context
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SurveyDetailsPage;
