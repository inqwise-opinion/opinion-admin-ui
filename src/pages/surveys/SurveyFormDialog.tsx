import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  Checkbox
} from '@mui/material';
import {
  Close as CloseIcon,
  Poll as SurveyIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Survey, SurveyForm, Account } from '../../types';
import { opinionApiService as ApiService } from '../../services';

interface SurveyFormDialogProps {
  open: boolean;
  survey?: Survey;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSave: (surveyData: Partial<Survey>) => Promise<void>;
}

const SURVEY_CATEGORIES = [
  'Market Research',
  'Customer Satisfaction',
  'Employee Feedback',
  'Product Research',
  'Academic Research',
  'Event Feedback',
  'Healthcare',
  'Education',
  'Non-Profit',
  'Other'
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
];

const SurveyFormDialog: React.FC<SurveyFormDialogProps> = ({
  open,
  survey,
  mode,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<SurveyForm>({
    title: '',
    description: '',
    accountId: undefined,
    status: 'draft',
    publishDate: '',
    closeDate: '',
    targetResponses: undefined,
    language: 'en',
    category: '',
    tags: [],
    isPublic: false,
    allowAnonymous: true,
    requireLogin: false,
    maxResponsesPerUser: 1,
    estimatedDuration: 5,
    settings: {
      emailNotifications: true,
      showProgressBar: true,
      allowBackButton: true,
      randomizeQuestions: false,
      customTheme: '',
      thankyouMessage: '',
      redirectUrl: '',
      collectIpAddress: false,
      collectLocationData: false
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Load available accounts
  useEffect(() => {
    if (open && (mode === 'create' || mode === 'edit')) {
      loadAvailableAccounts();
    }
  }, [open, mode]);

  const loadAvailableAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await ApiService.getAccounts({ 
        page: 1, 
        limit: 1000,
        status: 'enabled'
      });
      setAvailableAccounts(response.data.data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAvailableAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Initialize form data when survey prop changes
  useEffect(() => {
    if (survey && mode !== 'create') {
      setFormData({
        title: survey.title,
        description: survey.description || '',
        accountId: survey.accountId,
        status: survey.status,
        publishDate: survey.publishDate ? survey.publishDate.split('T')[0] : '',
        closeDate: survey.closeDate ? survey.closeDate.split('T')[0] : '',
        targetResponses: survey.targetResponses,
        language: survey.language || 'en',
        category: survey.category || '',
        tags: survey.tags || [],
        isPublic: survey.isPublic || false,
        allowAnonymous: survey.allowAnonymous !== false,
        requireLogin: survey.requireLogin || false,
        maxResponsesPerUser: survey.maxResponsesPerUser || 1,
        estimatedDuration: survey.estimatedDuration || 5,
        settings: {
          emailNotifications: survey.settings?.emailNotifications !== false,
          showProgressBar: survey.settings?.showProgressBar !== false,
          allowBackButton: survey.settings?.allowBackButton !== false,
          randomizeQuestions: survey.settings?.randomizeQuestions || false,
          customTheme: survey.settings?.customTheme || '',
          thankyouMessage: survey.settings?.thankyouMessage || '',
          redirectUrl: survey.settings?.redirectUrl || '',
          collectIpAddress: survey.settings?.collectIpAddress || false,
          collectLocationData: survey.settings?.collectLocationData || false
        }
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        accountId: undefined,
        status: 'draft',
        publishDate: '',
        closeDate: '',
        targetResponses: undefined,
        language: 'en',
        category: '',
        tags: [],
        isPublic: false,
        allowAnonymous: true,
        requireLogin: false,
        maxResponsesPerUser: 1,
        estimatedDuration: 5,
        settings: {
          emailNotifications: true,
          showProgressBar: true,
          allowBackButton: true,
          randomizeQuestions: false,
          customTheme: '',
          thankyouMessage: '',
          redirectUrl: '',
          collectIpAddress: false,
          collectLocationData: false
        }
      });
    }
    setErrors({});
  }, [survey, mode]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Survey title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Survey title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Survey title must be no more than 200 characters';
    }

    if (!formData.accountId) {
      newErrors.accountId = 'Please select an account';
    }

    if (formData.targetResponses && formData.targetResponses < 1) {
      newErrors.targetResponses = 'Target responses must be at least 1';
    }

    if (formData.maxResponsesPerUser && formData.maxResponsesPerUser < 1) {
      newErrors.maxResponsesPerUser = 'Max responses per user must be at least 1';
    }

    if (formData.estimatedDuration && formData.estimatedDuration < 1) {
      newErrors.estimatedDuration = 'Estimated duration must be at least 1 minute';
    }

    if (formData.publishDate && formData.closeDate) {
      if (new Date(formData.publishDate) >= new Date(formData.closeDate)) {
        newErrors.closeDate = 'Close date must be after publish date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof SurveyForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle settings changes
  const handleSettingsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  // Handle tags changes
  const handleTagsChange = (newTags: string[]) => {
    handleFieldChange('tags', newTags);
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Convert form data to survey data
      const surveyData: Partial<Survey> = {
        ...formData,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : undefined,
        closeDate: formData.closeDate ? new Date(formData.closeDate).toISOString() : undefined,
      };

      await onSave(surveyData);
    } catch (error) {
      console.error('Error saving survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';
  const dialogTitle = mode === 'create' ? 'Create Survey' : mode === 'edit' ? 'Edit Survey' : 'Survey Details';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SurveyIcon />
          {dialogTitle}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Survey Title *"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              disabled={isReadOnly}
              error={!!errors.title}
              helperText={errors.title}
              placeholder="Enter survey title"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Autocomplete
              fullWidth
              disabled={isReadOnly || loadingAccounts}
              options={availableAccounts}
              value={availableAccounts.find(account => account.accountId === formData.accountId) || null}
              onChange={(_, newValue) => {
                handleFieldChange('accountId', newValue?.accountId || undefined);
              }}
              getOptionLabel={(option) => option.accountName}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Account *"
                  placeholder="Select an account"
                  error={!!errors.accountId}
                  helperText={errors.accountId || (loadingAccounts ? 'Loading accounts...' : '')}
                />
              )}
              noOptionsText={loadingAccounts ? "Loading accounts..." : "No accounts available"}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              disabled={isReadOnly}
              placeholder="Enter survey description"
            />
          </Grid>

          {/* Survey Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Survey Configuration
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleFieldChange('status', e.target.value)}
                disabled={isReadOnly}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={formData.language}
                label="Language"
                onChange={(e) => handleFieldChange('language', e.target.value)}
                disabled={isReadOnly}
              >
                {LANGUAGES.map(lang => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => handleFieldChange('category', e.target.value)}
                disabled={isReadOnly}
              >
                {SURVEY_CATEGORIES.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Estimated Duration (min)"
              value={formData.estimatedDuration}
              onChange={(e) => handleFieldChange('estimatedDuration', parseInt(e.target.value) || undefined)}
              disabled={isReadOnly}
              error={!!errors.estimatedDuration}
              helperText={errors.estimatedDuration}
            />
          </Grid>

          {/* Dates and Targets */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Publish Date"
              type="date"
              value={formData.publishDate}
              onChange={(e) => handleFieldChange('publishDate', e.target.value)}
              disabled={isReadOnly}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Close Date"
              type="date"
              value={formData.closeDate}
              onChange={(e) => handleFieldChange('closeDate', e.target.value)}
              disabled={isReadOnly}
              error={!!errors.closeDate}
              helperText={errors.closeDate}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Target Responses"
              value={formData.targetResponses || ''}
              onChange={(e) => handleFieldChange('targetResponses', parseInt(e.target.value) || undefined)}
              disabled={isReadOnly}
              error={!!errors.targetResponses}
              helperText={errors.targetResponses}
            />
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
              disabled={isReadOnly}
              options={[]}
              value={formData.tags || []}
              onChange={(_, newValue) => handleTagsChange(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags..."
                  helperText="Press Enter to add a tag"
                />
              )}
            />
          </Grid>

          {/* Privacy and Access Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Privacy & Access
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={(e) => handleFieldChange('isPublic', e.target.checked)}
                  disabled={isReadOnly}
                />
              }
              label="Public Survey"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Allow survey to be found in public directories
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.allowAnonymous}
                  onChange={(e) => handleFieldChange('allowAnonymous', e.target.checked)}
                  disabled={isReadOnly}
                />
              }
              label="Allow Anonymous Responses"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Allow users to respond without logging in
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.requireLogin}
                  onChange={(e) => handleFieldChange('requireLogin', e.target.checked)}
                  disabled={isReadOnly}
                />
              }
              label="Require Login"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Users must be logged in to respond
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Responses Per User"
              value={formData.maxResponsesPerUser}
              onChange={(e) => handleFieldChange('maxResponsesPerUser', parseInt(e.target.value) || 1)}
              disabled={isReadOnly}
              error={!!errors.maxResponsesPerUser}
              helperText={errors.maxResponsesPerUser}
              inputProps={{ min: 1 }}
            />
          </Grid>

          {/* Advanced Settings */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon />
                  Advanced Settings
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.settings?.emailNotifications}
                            onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                            disabled={isReadOnly}
                          />
                        }
                        label="Email Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.settings?.showProgressBar}
                            onChange={(e) => handleSettingsChange('showProgressBar', e.target.checked)}
                            disabled={isReadOnly}
                          />
                        }
                        label="Show Progress Bar"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.settings?.allowBackButton}
                            onChange={(e) => handleSettingsChange('allowBackButton', e.target.checked)}
                            disabled={isReadOnly}
                          />
                        }
                        label="Allow Back Button"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.settings?.randomizeQuestions}
                            onChange={(e) => handleSettingsChange('randomizeQuestions', e.target.checked)}
                            disabled={isReadOnly}
                          />
                        }
                        label="Randomize Questions"
                      />
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.settings?.collectIpAddress}
                            onChange={(e) => handleSettingsChange('collectIpAddress', e.target.checked)}
                            disabled={isReadOnly}
                          />
                        }
                        label="Collect IP Address"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.settings?.collectLocationData}
                            onChange={(e) => handleSettingsChange('collectLocationData', e.target.checked)}
                            disabled={isReadOnly}
                          />
                        }
                        label="Collect Location Data"
                      />
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Thank You Message"
                      value={formData.settings?.thankyouMessage || ''}
                      onChange={(e) => handleSettingsChange('thankyouMessage', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Thank you for your response!"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Redirect URL"
                      value={formData.settings?.redirectUrl || ''}
                      onChange={(e) => handleSettingsChange('redirectUrl', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="https://example.com"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {!isReadOnly && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={mode === 'create' ? <SaveIcon /> : <EditIcon />}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Survey' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SurveyFormDialog;
