/**
 * Utility functions for form data validation and transformation
 */

import { Account, User } from '../types';

export type FormFieldValue = string | number | boolean | string[];

/**
 * Safely convert a value to a number or empty string for select components
 */
export function toSelectValue(value: unknown): string | number {
  if (value === null || value === undefined || value === 0) {
    return '';
  }
  return typeof value === 'string' ? value : Number(value);
}

/**
 * Convert select value back to number for API submission
 */
export function fromSelectValue(value: string | number): number | undefined {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(numValue) ? undefined : numValue;
}

/**
 * Create initial form data from account data
 */
export function createAccountFormData(account: Account) {
  return {
    accountName: account.accountName || '',
    ownerId: toSelectValue(account.ownerId),
    packageId: toSelectValue(account.packageId),
    timezoneId: toSelectValue(account.timezoneId),
    isActive: account.isActive,
    permissions: account.permissions || [],
    inheritPermissions: account.inheritPermissions || false,
  };
}

/**
 * Transform form data for API submission
 */
export function transformAccountFormData(formData: ReturnType<typeof createAccountFormData>) {
  return {
    accountName: formData.accountName.trim(),
    ownerId: fromSelectValue(formData.ownerId),
    packageId: fromSelectValue(formData.packageId),
    timezoneId: fromSelectValue(formData.timezoneId),
    isActive: formData.isActive,
    permissions: formData.permissions,
    inheritPermissions: formData.inheritPermissions,
  };
}

/**
 * Create initial user form data from user data
 */
export function createUserFormData(user: User) {
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    displayName: user.displayName || '',
    email: user.email || '',
    address1: user.address1 || '',
    address2: user.address2 || '',
    city: user.city || '',
    countryId: toSelectValue(user.countryId),
    stateId: toSelectValue(user.stateId),
    postalCode: user.postalCode || '',
    phone1: user.phone1 || '',
    sendNewsLetters: user.sendNewsLetters || false,
    comments: user.comments || '',
  };
}

/**
 * Transform user form data for API submission
 */
export function transformUserFormData(formData: ReturnType<typeof createUserFormData>) {
  return {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email,
    address1: formData.address1,
    address2: formData.address2,
    city: formData.city,
    countryId: fromSelectValue(formData.countryId),
    stateId: fromSelectValue(formData.stateId),
    postalCode: formData.postalCode,
    phone1: formData.phone1,
    displayName: formData.displayName,
    sendNewsLetters: formData.sendNewsLetters,
    comments: formData.comments,
  };
}

/**
 * Validate password data
 */
export function validatePasswordData(passwordData: {
  newPassword: string;
  confirmNewPassword: string;
}): string | null {
  if (passwordData.newPassword.length < 6 || passwordData.newPassword.length > 12) {
    return 'Password must be between 6-12 characters';
  }
  
  if (passwordData.newPassword !== passwordData.confirmNewPassword) {
    return 'Passwords do not match';
  }
  
  return null;
}
