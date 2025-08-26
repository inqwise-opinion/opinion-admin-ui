import React, { useCallback } from 'react';
import {
  Box,
  Grid,
  Chip,
  TextField,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { User } from '../../../types';
import { LOCALES, TIMEZONES, USER_ROLES } from '../../../constants';
import { opinionApiService } from '../../../services';
import {
  ViewEditForm,
  ViewEditField,
  ViewEditSelect,
  ViewEditSwitch,
  ViewOnlyField,
  useViewEditForm
} from '../../forms';

interface UserProfileTabProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({ user, onUserUpdate }) => {
  // Prepare form data from user
  const initialFormData = {
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'user',
    status: user.status || 'active',
    locale: user.locale || 'en-US',
    timezone: user.timezone || 'UTC',
    emailVerified: user.emailVerified || false,
    mfaEnabled: user.mfaEnabled || false,
    tags: user.tags || [],
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

  // Save function
  const handleSave = useCallback(async (formData: typeof initialFormData) => {
    const response = await opinionApiService.updateUser(parseInt(user.id), {
      ...formData,
      tags: formData.tags
    });
    
    if (response.success && response.data) {
      onUserUpdate(response.data);
    } else {
      throw new Error(response.error?.message || 'Failed to update user profile');
    }
  }, [user.id, onUserUpdate]);

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
    successMessage: 'User profile updated successfully',
  });

  // Tag management
  const handleAddTag = (newTag: string) => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateData({
        tags: [...formData.tags, newTag.trim()]
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateData({
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Prepare options for select fields
  const roleOptions = USER_ROLES.map(role => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1)
  }));

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const localeOptions = LOCALES.map(locale => ({
    value: locale.code,
    label: `${locale.name} (${locale.code})`
  }));

  const timezoneOptions = TIMEZONES.map(timezone => ({
    value: timezone,
    label: timezone
  }));

  return (
    <ViewEditForm
      title="Profile Information"
      isEditing={isEditing}
      isDirty={isDirty}
      isSaving={isSaving}
      isRefreshing={false}
      error={error}
      success={success}
      onEdit={startEditing}
      onSave={save}
      onCancel={cancel}
    >
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Box>
            <Box sx={{ mb: 3 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>
                Basic Information
              </h3>
              
              <ViewEditField
                label="Full Name"
                value={formData.fullName}
                onChange={(value) => updateData({ fullName: value })}
                isEditing={isEditing}
                error={errors.fullName}
                required
                fullWidth
              />

              <ViewEditField
                label="Email"
                value={formData.email}
                onChange={(value) => updateData({ email: value })}
                isEditing={isEditing}
                error={errors.email}
                type="email"
                required
                fullWidth
              />

              <ViewEditField
                label="Phone"
                value={formData.phone}
                onChange={(value) => updateData({ phone: value })}
                isEditing={isEditing}
                error={errors.phone}
                type="tel"
                fullWidth
              />

              <ViewEditSelect
                label="Locale"
                value={formData.locale}
                onChange={(value) => updateData({ locale: value })}
                options={localeOptions}
                isEditing={isEditing}
                fullWidth
              />

              <ViewEditSelect
                label="Timezone"
                value={formData.timezone}
                onChange={(value) => updateData({ timezone: value })}
                options={timezoneOptions}
                isEditing={isEditing}
                fullWidth
              />
            </Box>
          </Box>
        </Grid>

        {/* Account Settings */}
        <Grid item xs={12} md={6}>
          <Box>
            <Box sx={{ mb: 3 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>
                Account Settings
              </h3>
              
              <ViewEditSelect
                label="Role"
                value={formData.role}
                onChange={(value) => updateData({ role: value })}
                options={roleOptions}
                isEditing={isEditing}
                renderValue={(value) => (
                  <Chip 
                    label={roleOptions.find(r => r.value === value)?.label || value} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              />

              <ViewEditSelect
                label="Status"
                value={formData.status}
                onChange={(value) => updateData({ status: value })}
                options={statusOptions}
                isEditing={isEditing}
                renderValue={(value) => (
                  <Chip 
                    label={statusOptions.find(s => s.value === value)?.label || value} 
                    size="small" 
                    color={
                      value === 'active' ? 'success' : 
                      value === 'pending' ? 'warning' : 
                      'default'
                    }
                  />
                )}
              />

              <ViewEditSwitch
                label="Email Verified"
                value={formData.emailVerified}
                onChange={(checked) => updateData({ emailVerified: checked })}
                isEditing={isEditing}
              />

              <ViewEditSwitch
                label="MFA Enabled"
                value={formData.mfaEnabled}
                onChange={(checked) => updateData({ mfaEnabled: checked })}
                isEditing={isEditing}
              />
            </Box>
          </Box>
        </Grid>

        {/* Tags Section */}
        <Grid item xs={12}>
          <Box>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>
              Tags
            </h3>
            
            {isEditing ? (
              <Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      deleteIcon={<CloseIcon />}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="Add new tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        handleAddTag(target.value);
                        target.value = '';
                      }
                    }}
                    sx={{ maxWidth: 200 }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input');
                      if (input) {
                        handleAddTag(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.length > 0 ? (
                  formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Box sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    No tags assigned
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Read-only Information */}
        <Grid item xs={12}>
          <Box>
            <h3 style={{ margin: '24px 0 16px 0', fontSize: '1.1rem' }}>
              System Information
            </h3>
            
            <ViewOnlyField
              label="User ID"
              value={user.id}
            />
            
            <ViewOnlyField
              label="Username"
              value={user.userName}
            />
            
            <ViewOnlyField
              label="Display Name"
              value={user.displayName}
            />
            
            <ViewOnlyField
              label="Created Date"
              value={user.createdAt}
              renderValue={(date) => date ? new Date(date).toLocaleDateString() : 'N/A'}
            />
            
            <ViewOnlyField
              label="Last Login"
              value={user.lastLoginAt}
              renderValue={(date) => date ? new Date(date).toLocaleString() : 'Never'}
            />
          </Box>
        </Grid>
      </Grid>
    </ViewEditForm>
  );
};

export default UserProfileTab;
