/**
 * Unit tests for form utilities
 */

import { 
  toSelectValue, 
  fromSelectValue, 
  createAccountFormData,
  transformAccountFormData,
  createUserFormData,
  transformUserFormData,
  validatePasswordData
} from '../formUtils';
import { Account, User } from '../../types';

describe('formUtils', () => {
  describe('toSelectValue', () => {
    it('should convert null/undefined/0 to empty string', () => {
      expect(toSelectValue(null)).toBe('');
      expect(toSelectValue(undefined)).toBe('');
      expect(toSelectValue(0)).toBe('');
    });

    it('should preserve string values', () => {
      expect(toSelectValue('123')).toBe('123');
      expect(toSelectValue('')).toBe('');
    });

    it('should convert numbers to numbers', () => {
      expect(toSelectValue(123)).toBe(123);
      expect(toSelectValue(232)).toBe(232);
    });
  });

  describe('fromSelectValue', () => {
    it('should convert empty values to undefined', () => {
      expect(fromSelectValue('')).toBeUndefined();
      expect(fromSelectValue(null as any)).toBeUndefined();
      expect(fromSelectValue(undefined as any)).toBeUndefined();
    });

    it('should convert valid strings to numbers', () => {
      expect(fromSelectValue('123')).toBe(123);
      expect(fromSelectValue('0')).toBe(0);
    });

    it('should preserve numbers', () => {
      expect(fromSelectValue(123)).toBe(123);
      expect(fromSelectValue(0)).toBe(0);
    });

    it('should handle invalid strings', () => {
      expect(fromSelectValue('invalid')).toBeUndefined();
      expect(fromSelectValue('abc')).toBeUndefined();
    });
  });

  describe('createAccountFormData', () => {
    it('should create form data from account data', () => {
      const account: Partial<Account> = {
        accountName: 'Test Account',
        ownerId: 123,
        packageId: 2,
        timezoneId: 3,
        isActive: true,
        permissions: ['READ', 'WRITE'],
        inheritPermissions: false,
      };

      const formData = createAccountFormData(account as Account);
      
      expect(formData.accountName).toBe('Test Account');
      expect(formData.ownerId).toBe(123);
      expect(formData.packageId).toBe(2);
      expect(formData.timezoneId).toBe(3);
      expect(formData.isActive).toBe(true);
      expect(formData.permissions).toEqual(['READ', 'WRITE']);
      expect(formData.inheritPermissions).toBe(false);
    });

    it('should handle undefined values', () => {
      const account: Partial<Account> = {
        accountName: 'Test Account',
        isActive: true,
      };

      const formData = createAccountFormData(account as Account);
      
      expect(formData.ownerId).toBe('');
      expect(formData.packageId).toBe('');
      expect(formData.timezoneId).toBe('');
      expect(formData.permissions).toEqual([]);
      expect(formData.inheritPermissions).toBe(false);
    });
  });

  describe('transformAccountFormData', () => {
    it('should transform form data for API submission', () => {
      const formData = {
        accountName: '  Test Account  ',
        ownerId: '123',
        packageId: 2,
        timezoneId: '',
        isActive: true,
        permissions: ['READ'],
        inheritPermissions: true,
      };

      const result = transformAccountFormData(formData);

      expect(result.accountName).toBe('Test Account'); // trimmed
      expect(result.ownerId).toBe(123);
      expect(result.packageId).toBe(2);
      expect(result.timezoneId).toBeUndefined(); // empty string converted
      expect(result.isActive).toBe(true);
      expect(result.permissions).toEqual(['READ']);
      expect(result.inheritPermissions).toBe(true);
    });
  });

  describe('createUserFormData', () => {
    it('should create user form data from user data', () => {
      const user: Partial<User> = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        countryId: 232,
        sendNewsLetters: true,
      };

      const formData = createUserFormData(user as User);

      expect(formData.firstName).toBe('John');
      expect(formData.lastName).toBe('Doe');
      expect(formData.email).toBe('john@example.com');
      expect(formData.countryId).toBe(232);
      expect(formData.sendNewsLetters).toBe(true);
    });

    it('should handle undefined values with defaults', () => {
      const user: Partial<User> = {};
      const formData = createUserFormData(user as User);

      expect(formData.firstName).toBe('');
      expect(formData.lastName).toBe('');
      expect(formData.countryId).toBe('');
      expect(formData.sendNewsLetters).toBe(false);
    });
  });

  describe('transformUserFormData', () => {
    it('should transform user form data for API submission', () => {
      const formData = {
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: 'john@example.com',
        countryId: '232',
        stateId: '',
        sendNewsLetters: true,
        displayName: 'John Doe',
        address1: '',
        address2: '',
        city: '',
        postalCode: '',
        phone1: '',
        comments: '',
      };

      const result = transformUserFormData(formData);

      expect(result.firstName).toBe('John'); // trimmed
      expect(result.lastName).toBe('Doe'); // trimmed
      expect(result.countryId).toBe(232);
      expect(result.stateId).toBeUndefined();
      expect(result.sendNewsLetters).toBe(true);
    });
  });

  describe('validatePasswordData', () => {
    it('should return null for valid passwords', () => {
      const passwordData = {
        newPassword: 'password123',
        confirmNewPassword: 'password123',
      };

      expect(validatePasswordData(passwordData)).toBeNull();
    });

    it('should return error for password too short', () => {
      const passwordData = {
        newPassword: '123',
        confirmNewPassword: '123',
      };

      expect(validatePasswordData(passwordData)).toBe('Password must be between 6-12 characters');
    });

    it('should return error for password too long', () => {
      const passwordData = {
        newPassword: 'verylongpassword',
        confirmNewPassword: 'verylongpassword',
      };

      expect(validatePasswordData(passwordData)).toBe('Password must be between 6-12 characters');
    });

    it('should return error for password mismatch', () => {
      const passwordData = {
        newPassword: 'password123',
        confirmNewPassword: 'password456',
      };

      expect(validatePasswordData(passwordData)).toBe('Passwords do not match');
    });
  });
});
