import React, { useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Container
} from '@mui/material';
import {
  ViewEditForm,
  ViewEditField,
  ViewEditSelect,
  ViewEditSwitch,
  ViewOnlyField,
  useViewEditForm
} from '../../components/forms';

// Mock user data for demo
const mockUser = {
  id: '1',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  role: 'user',
  status: 'active',
  locale: 'en-US',
  timezone: 'UTC',
  emailVerified: true,
  mfaEnabled: false,
  tags: ['demo', 'test-user'],
  createDate: '2023-01-15T10:30:00Z',
  lastLogin: '2023-08-22T14:22:00Z'
};

const ViewEditFormDemo: React.FC = () => {
  // Prepare form data from user
  const initialFormData = {
    fullName: mockUser.fullName || '',
    email: mockUser.email || '',
    phone: mockUser.phone || '',
    role: mockUser.role || 'user',
    status: mockUser.status || 'active',
    locale: mockUser.locale || 'en-US',
    timezone: mockUser.timezone || 'UTC',
    emailVerified: mockUser.emailVerified || false,
    mfaEnabled: mockUser.mfaEnabled || false,
    tags: mockUser.tags || [],
  };

  // Validation function
  const validateForm = useCallback((data: typeof initialFormData) => {
    const errors: Record<string, string> = {};

    if (!data.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    return errors;
  }, []);

  // Mock save function
  const handleSave = useCallback(async (formData: typeof initialFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving form data:', formData);
    
    // Simulate success
    return Promise.resolve();
  }, []);

  // Use the unified view/edit form hook
  const {
    data: formData,
    isEditing,
    isDirty,
    isSaving,
    errors,
    error,
    success,
    updateData,
    startEditing,
    save,
    cancel,
  } = useViewEditForm({
    initialData: initialFormData,
    onSave: handleSave,
    validate: validateForm,
    successMessage: 'Demo form updated successfully!',
  });

  // Prepare options for select fields
  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'viewer', label: 'Viewer' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const localeOptions = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'es-ES', label: 'Spanish' },
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
    { value: 'Europe/London', label: 'Europe/London' },
    { value: 'Europe/Paris', label: 'Europe/Paris' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🎉 View/Edit Form Unified Components Demo
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4 }}>
        This demonstrates the new unified view/edit form components with consistent state management,
        validation, and user experience across all forms.
      </Typography>

      <ViewEditForm
        title="User Profile Demo"
        subtitle="Demonstrating unified view/edit form functionality"
        isEditing={isEditing}
        isDirty={isDirty}
        isSaving={isSaving}
        isRefreshing={false}
        error={error}
        success={success}
        onEdit={startEditing}
        onSave={save}
        onCancel={cancel}
        card
      >
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              
              <ViewEditField
                label="Full Name"
                value={formData.fullName}
                onChange={(value) => updateData({ fullName: value })}
                isEditing={isEditing}
                error={errors.fullName}
                required
                labelWidth={120}
              />

              <ViewEditField
                label="Email"
                value={formData.email}
                onChange={(value) => updateData({ email: value })}
                isEditing={isEditing}
                error={errors.email}
                type="email"
                required
                labelWidth={120}
              />

              <ViewEditField
                label="Phone"
                value={formData.phone}
                onChange={(value) => updateData({ phone: value })}
                isEditing={isEditing}
                error={errors.phone}
                type="tel"
                labelWidth={120}
              />

              <ViewEditSelect
                label="Locale"
                value={formData.locale}
                onChange={(value) => updateData({ locale: value })}
                options={localeOptions}
                isEditing={isEditing}
                labelWidth={120}
              />

              <ViewEditSelect
                label="Timezone"
                value={formData.timezone}
                onChange={(value) => updateData({ timezone: value })}
                options={timezoneOptions}
                isEditing={isEditing}
                labelWidth={120}
              />
            </Box>
          </Grid>

          {/* Account Settings */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              
              <ViewEditSelect
                label="Role"
                value={formData.role}
                onChange={(value) => updateData({ role: value })}
                options={roleOptions}
                isEditing={isEditing}
                labelWidth={120}
              />

              <ViewEditSelect
                label="Status"
                value={formData.status}
                onChange={(value) => updateData({ status: value })}
                options={statusOptions}
                isEditing={isEditing}
                labelWidth={120}
              />

              <ViewEditSwitch
                label="Email Verified"
                value={formData.emailVerified}
                onChange={(checked) => updateData({ emailVerified: checked })}
                isEditing={isEditing}
                labelWidth={120}
              />

              <ViewEditSwitch
                label="MFA Enabled"
                value={formData.mfaEnabled}
                onChange={(checked) => updateData({ mfaEnabled: checked })}
                isEditing={isEditing}
                labelWidth={120}
              />
            </Box>
          </Grid>

          {/* Read-only Information */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                System Information (Read-Only)
              </Typography>
              
              <ViewOnlyField
                label="User ID"
                value={mockUser.id}
                labelWidth={120}
              />
              
              <ViewOnlyField
                label="Created Date"
                value={mockUser.createDate}
                renderValue={(date) => date ? new Date(date).toLocaleDateString() : 'N/A'}
                labelWidth={120}
              />
              
              <ViewOnlyField
                label="Last Login"
                value={mockUser.lastLogin}
                renderValue={(date) => date ? new Date(date).toLocaleString() : 'Never'}
                labelWidth={120}
              />

              <ViewOnlyField
                label="Tags"
                value={mockUser.tags}
                renderValue={(tags) => 
                  Array.isArray(tags) && tags.length > 0 
                    ? tags.join(', ')
                    : 'No tags assigned'
                }
                labelWidth={120}
              />
            </Box>
          </Grid>
        </Grid>
      </ViewEditForm>

      {/* Demo Information */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          🚀 What's New:
        </Typography>
        <Typography component="div" variant="body2">
          <ul>
            <li><strong>Unified State Management:</strong> Single useViewEditForm hook handles all form state consistently</li>
            <li><strong>Automatic View/Edit Switching:</strong> Components automatically render appropriate mode</li>
            <li><strong>Built-in Validation:</strong> Validation runs before save with field-level error display</li>
            <li><strong>Consistent Save/Cancel/Edit:</strong> Standardized button behavior and loading states</li>
            <li><strong>Error & Success Handling:</strong> Centralized error and success message management</li>
            <li><strong>Dirty State Tracking:</strong> Save button only enabled when changes are made</li>
            <li><strong>Type Safety:</strong> Full TypeScript support with proper type inference</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};

export default ViewEditFormDemo;
