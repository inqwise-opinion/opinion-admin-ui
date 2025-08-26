// Core API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// User Related Types
export interface User {
  // Original API fields
  userId: number;
  userName: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  countryId?: number;
  countryName?: string;
  countryCode?: string;
  provider?: string;
  isActive: boolean;
  insertDate: string;
  lastLoginDate?: string;
  clientIp?: string;
  sendNewsLetters?: boolean;
  gatewayId?: string;
  // Additional fields for admin UI
  id: string; // For consistency with DataGrid (using string for UUID)
  username: string; // For display (maps to userName)
  fullName: string; // Combined first + last name or displayName
  phone?: string;
  phone1?: string; // From JSP
  role: "admin" | "user" | "moderator" | "analyst" | "editor" | "viewer";
  status: "active" | "disabled" | "pending";
  avatar?: string;
  locale?: string;
  timezone?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  tags?: string[];
  companyName?: string;
  planName?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  // Address fields from JSP
  address1?: string;
  address2?: string;
  city?: string;
  stateId?: number;
  postalCode?: string;
  comments?: string;
}

export interface UserHistory {
  id: number;
  userId: number;
  userName: string;
  typeId: number;
  typeName: string;
  countryName?: string;
  clientIp?: string;
  insertDate: string;
}

// Account Related Types
export interface Account {
  accountId: number;
  accountName: string;
  ownerId?: number;
  ownerUserName?: string;
  servicePackageName: string; // Current Plan
  packageId?: number;
  timezoneId?: number;
  timezone?: string;
  isActive: boolean;
  status: "enabled" | "disabled" | "expired" | "suspended";
  insertDate: string;
  planExpirationDate?: string;
  remainingResponses?: number;
  permissions?: string[];
  inheritPermissions?: boolean;
  // Additional fields for the admin UI
  id: number; // For consistency with DataGrid
  companyName?: string;
  contactEmail?: string;
  contactName?: string;
  lastActivityDate?: string;
  totalUsers?: number;
  totalSurveys?: number;
  totalResponses?: number;
}

export interface AccountCharge {
  chargeId: number;
  accountId: number;
  amount: number;
  currency: string;
  description: string;
  chargeType: string;
  status: string;
  insertDate: string;
  processedDate?: string;
}

export interface AccountInvoice {
  invoiceId: number;
  accountId: number;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  insertDate: string;
  paidDate?: string;
}

// Survey Related Types - matching original API structure
export interface Survey {
  opinionId: number; // Primary identifier from API
  accountId: number;
  accountName?: string;
  name: string; // Survey name/title
  description?: string;
  previewUrl?: string;
  started: number; // Total responses/started
  completed: number; // Completed responses
  partial: number; // Partial responses
  disqualified?: number; // Disqualified responses
  completionRate?: number; // Calculated completion rate
  timeTaken?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }; // Average time taken
  insertDate?: string;
  modifyDate?: string; // Last modification date
  cntControls?: number; // Question count
  status?: string;
  isActive?: boolean;

  // Additional fields for admin UI compatibility
  id?: number; // For DataGrid consistency
  surveyId?: number; // Alternative identifier
  title?: string; // Alternative to name
  totalResponses?: number; // Alternative to started
  lastResponseDate?: string;
}

export interface SurveySettings {
  emailNotifications?: boolean;
  showProgressBar?: boolean;
  allowBackButton?: boolean;
  randomizeQuestions?: boolean;
  customTheme?: string;
  thankyouMessage?: string;
  redirectUrl?: string;
  collectIpAddress?: boolean;
  collectLocationData?: boolean;
}

export interface SurveyForm {
  title: string;
  description?: string;
  accountId?: number;
  status: "draft" | "active" | "paused" | "completed" | "archived" | "closed";
  publishDate?: string;
  closeDate?: string;
  targetResponses?: number;
  language?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  allowAnonymous?: boolean;
  requireLogin?: boolean;
  maxResponsesPerUser?: number;
  estimatedDuration?: number;
  settings?: SurveySettings;
}

export interface Poll {
  pollId: number;
  accountId: number;
  title: string;
  description?: string;
  status: string;
  isActive: boolean;
  insertDate: string;
  totalVotes: number;
}

// Collector Related Types
export interface Collector {
  collectorId: number;
  name: string;
  sourceTypeId: number; // Type ID (1=Direct link, 2=CINT panel)
  statusId: number; // Status ID (1=Open/Live, 2=Closed/Completed, etc.)
  accountId: number;
  accountName: string;
  opinionId: number; // Survey ID
  opinionName: string;
  opinionTypeName: string; // Survey type name
  started: number; // Total responses
  completed: number;
  partial: number;
  disqualified?: number;
  timeTaken?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  lastResponseDate?: string;
  insertDate?: string;
  isActive?: boolean;
  url?: string;
}

export interface CollectorTotals {
  started: number;
  completed: number;
  partial: number;
  disqualified: number;
  completionRate: number;
}

export interface CollectorFilter {
  includeExpired?: boolean;
  top?: number;
  from?: string;
  to?: string;
}

// Payment Related Types
export interface Payment {
  paymentId: number;
  accountId: number;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionId?: string;
  insertDate: string;
  processedDate?: string;
}

// System Related Types
export interface SystemEvent {
  eventId: number;
  eventType: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  insertDate: string;
  userId?: number;
  accountId?: number;
  additionalData?: any;
}

// Dashboard Data Types
export interface DashboardStats {
  todayUsers: number;
  activeUsers: number;
  totalAccounts: number;
  totalSurveys: number;
  totalResponses: number;
  revenue: number;
}

// Pagination and Filtering
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  fromDate?: string; // For Dashboard recent users filtering
  typeIds?: number[]; // For Dashboard user history filtering
  productId?: number; // For Dashboard user history filtering
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Environment Types
export interface EnvironmentConfig {
  apiBaseUrl: string;
  enableMockApi: boolean;
  enableDebug: boolean;
  enableLogging: boolean;
  itemsPerPage: number;
  maxUploadSize: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserForm {
  fullName: string;
  email: string;
  phone?: string;
  role: "admin" | "user" | "moderator" | "analyst" | "editor" | "viewer";
  status: "active" | "disabled" | "pending";
  locale?: string;
  timezone?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  tags?: string[];
}

// User Details Related Types
export interface ActivityEvent {
  id: string;
  timestamp: string;
  event: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
  severity: "info" | "warning" | "error";
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastSeen: string;
  isCurrent: boolean;
  isActive: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  downloadUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    type: "user" | "admin" | "system";
  };
  action: string;
  target: {
    type: string;
    id: string;
    name?: string;
  };
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  severity: "info" | "warning" | "error";
}

export interface AccountForm {
  accountName: string;
  ownerId?: number;
  packageId?: number;
  timezoneId?: number;
  isActive: boolean;
  permissions?: string[];
  inheritPermissions?: boolean;
  // Optional additional fields
  companyName?: string;
  contactEmail?: string;
  contactName?: string;
  planExpirationDate?: string;
  remainingResponses?: number;
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

export type Theme = "light" | "dark";

export interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  loading: LoadingState;
  errors: ErrorState;
}

// Transaction-related types
export interface Transaction {
  transactionId: number;
  typeId: number;
  accountId: number;
  amount: number;
  debit?: number;
  credit?: number;
  balance: number;
  comments?: string;
  referenceId?: number;
  chargeDescription?: string;
  creditCard?: string;
  creditCardTypeId?: number;
  modifyDate: string;
  insertDate: string;
}

export interface TransactionGroup {
  fromDate: string;
  toDate: string;
  transactions: Transaction[];
  debit?: number;
  credit?: number;
  balance?: number;
  invoices?: any[];
}

export interface AccountBalance {
  balance: number;
  lastFundTransaction?: {
    amount: number;
    modifyDate: string;
    creditCard?: string;
    creditCardTypeId?: number;
    comments?: string;
  };
}

export interface TransactionRequest {
  accountId: number;
  amount: number;
  comments: string;
}

export interface TransactionFilter {
  transactionTypes?: number[];
  groupBy?: string;
}

// Invoice List (Billing) Types
export interface InvoiceListItem {
  invoiceId: number;
  accountId: number;
  accountName: string;
  invoiceDate?: string;
  fromDate: string;
  toDate: string;
  statusId: number;
  status?: string;
  amount: number;
  currency?: string;
}

export interface InvoiceListFilter {
  statusId?: number | null;
  search?: string;
  accountId?: number | null;
}

// Package/Plan Related Types
export interface Package {
  packageId: number;
  packageName: string;
  description?: string;
  insertDate: string;
  isDefault?: boolean;
  defaultUsagePeriod?: number | null;
  isActive?: boolean;
  productId?: number;
  // Additional fields for admin UI
  id: number; // For DataGrid consistency
  name: string; // Alternative to packageName
  createDate: string; // Alternative to insertDate
  status?: "active" | "inactive";
  price?: number;
  currency?: string;
  features?: string[];
  maxUsers?: number;
  maxSurveys?: number;
  maxResponses?: number;
}

export interface PackageForm {
  packageName: string;
  description?: string;
  isActive: boolean;
  isDefault?: boolean;
  defaultUsagePeriod?: number | null;
  price?: number;
  currency?: string;
  features?: string[];
  maxUsers?: number;
  maxSurveys?: number;
  maxResponses?: number;
}

export interface PackageFilter {
  search?: string;
  isActive?: boolean;
  productId?: number;
}
