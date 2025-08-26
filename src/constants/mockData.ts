/**
 * Constants used in mock data generation
 */

// Valid country IDs that match the UserDetailsTab dropdown options
export const VALID_COUNTRY_IDS = [232, 39, 230] as const;

export const COUNTRIES = [
  { id: 232, name: 'United States', code: 'US' },
  { id: 39, name: 'Canada', code: 'CA' },
  { id: 230, name: 'United Kingdom', code: 'GB' },
] as const;

export const COUNTRY_NAMES = [
  'United States', 'United Kingdom', 'Canada', 
  'Germany', 'France', 'Australia', 'Japan', 'Brazil'
] as const;

export const COUNTRY_CODES = [
  'US', 'GB', 'CA', 'DE', 'FR', 'AU', 'JP', 'BR'
] as const;

export const AUTH_PROVIDERS = [
  'Google', 'Facebook', 'LinkedIn', 'Email', 'Twitter'
] as const;

export const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 
  'Chris', 'Lisa', 'Robert', 'Amanda', 'James', 'Jessica'
] as const;

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 
  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White'
] as const;

export const USER_ROLES = ['admin', 'moderator', 'user'] as const;

export const USER_STATUSES = ['active', 'inactive', 'pending'] as const;

export const ACCOUNT_STATUSES = ['enabled', 'disabled', 'expired', 'suspended'] as const;

export const SERVICE_PACKAGE_NAMES = ['Basic', 'Professional', 'Enterprise', 'Premium'] as const;

export const PLAN_NAMES = ['Free', 'Basic', 'Pro', 'Enterprise'] as const;

export const COMPANY_NAMES = [
  'Acme Corporation', 'Global Dynamics', 'TechCorp Solutions', 'Innovation Labs',
  'DataStream Inc', 'CloudVision Ltd', 'NextGen Systems', 'DigitalEdge Corp',
  'SmartWave Technologies', 'FutureLink Partners'
] as const;

export const TIMEZONES = [
  { timezoneId: 1, timezone: 'UTC' },
  { timezoneId: 2, timezone: 'EST (UTC-5)' },
  { timezoneId: 3, timezone: 'PST (UTC-8)' },
  { timezoneId: 4, timezone: 'CET (UTC+1)' },
  { timezoneId: 5, timezone: 'JST (UTC+9)' },
] as const;

export const PACKAGES = [
  { packageId: 1, packageName: 'Basic' },
  { packageId: 2, packageName: 'Professional' },
  { packageId: 3, packageName: 'Enterprise' },
  { packageId: 4, packageName: 'Premium' },
] as const;

export const SURVEY_STATUSES = ['draft', 'active', 'paused', 'completed', 'archived', 'closed'] as const;

export const SURVEY_CATEGORIES = [
  'Market Research', 'Customer Satisfaction', 'Employee Feedback', 
  'Product Research', 'Academic Research', 'Event Feedback'
] as const;

export const SURVEY_LANGUAGES = ['en', 'es', 'fr', 'de'] as const;

export const SURVEY_TITLES = [
  'Customer Satisfaction Survey', 'Product Feedback', 'Market Research Study', 'Employee Engagement',
  'Brand Awareness Study', 'User Experience Feedback', 'Annual Review Survey', 'Event Feedback',
  'Website Usability Study', 'Training Evaluation', 'Service Quality Assessment', 'Product Launch Research',
  'Customer Journey Mapping', 'Competitor Analysis', 'Price Sensitivity Study', 'Feature Request Survey'
] as const;

export const USER_HISTORY_TYPES = [
  { id: 1, name: 'Login' },
  { id: 2, name: 'Logout' },
  { id: 3, name: 'Survey Created' },
  { id: 4, name: 'Survey Updated' },
  { id: 5, name: 'Poll Created' },
  { id: 6, name: 'Account Updated' },
] as const;
