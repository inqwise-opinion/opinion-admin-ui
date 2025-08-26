// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    VALIDATE: "/auth/validate",
    REFRESH: "/auth/refresh",
  },

  // Users
  USERS: {
    LIST: "/users",
    GET: (id: string) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    HISTORY: "/users/history",
    ACTIVITY: (id: string) => `/users/${id}/activity`,
    PERMISSIONS: (id: string) => `/users/${id}/permissions`,
    BILLING: (id: string) => `/users/${id}/billing`,
    INVOICES: (id: string) => `/users/${id}/invoices`,
    NOTIFICATIONS: (id: string) => `/users/${id}/notifications`,
    SESSIONS: (id: string) => `/users/${id}/sessions`,
    SECURITY: (id: string) => `/users/${id}/security`,
    AUDIT: (id: string) => `/users/${id}/audit`,
    IMPERSONATE: (id: string) => `/users/${id}/impersonate`,
    RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
    RESEND_INVITE: (id: string) => `/users/${id}/resend-invite`,
    EXPORT_DATA: (id: string) => `/users/${id}/export`,
    REVOKE_SESSION: (id: string, sessionId: string) =>
      `/users/${id}/sessions/${sessionId}`,
    REVOKE_ALL_SESSIONS: (id: string) => `/users/${id}/sessions`,
    DOWNLOAD_INVOICE: (invoiceId: string) => `/invoices/${invoiceId}/download`,
  },

  // Accounts
  ACCOUNTS: {
    LIST: "/accounts",
    GET: (id: number) => `/accounts/${id}`,
    CREATE: "/accounts",
    UPDATE: (id: number) => `/accounts/${id}`,
    DELETE: (id: number) => `/accounts/${id}`,
    CHARGES: (id: number) => `/accounts/${id}/charges`,
    INVOICES: (id: number) => `/accounts/${id}/invoices`,
    USERS: (id: number) => `/accounts/${id}/users`,
  },

  // Surveys
  SURVEYS: {
    LIST: "/surveys",
    GET: (id: number) => `/surveys/${id}`,
    CREATE: "/surveys",
    UPDATE: (id: number) => `/surveys/${id}`,
    DELETE: (id: number) => `/surveys/${id}`,
  },

  // Polls
  POLLS: {
    LIST: "/polls",
    GET: (id: number) => `/polls/${id}`,
    CREATE: "/polls",
    UPDATE: (id: number) => `/polls/${id}`,
    DELETE: (id: number) => `/polls/${id}`,
  },

  // Collectors
  COLLECTORS: {
    LIST: "/collectors",
    GET: (id: number) => `/collectors/${id}`,
    CREATE: "/collectors",
    UPDATE: (id: number) => `/collectors/${id}`,
    DELETE: (id: number) => `/collectors/${id}`,
  },

  // Payments
  PAYMENTS: {
    LIST: "/payments",
    GET: (id: number) => `/payments/${id}`,
    CREATE: "/payments",
    UPDATE: (id: number) => `/payments/${id}`,
  },

  // Dashboard
  DASHBOARD: {
    STATS: "/dashboard/stats",
    RECENT_USERS: "/dashboard/recent-users",
    ACTIVE_USERS: "/dashboard/active-users",
  },

  // System
  SYSTEM: {
    EVENTS: "/system/events",
    HEALTH: "/system/health",
  },

  // Setup/Plans
  SETUP: {
    PLANS: "/setup/plans",
    PACKAGES: "/setup/packages",
  },

  // Packages
  PACKAGES: {
    LIST: "/packages",
    GET: (id: number) => `/packages/${id}`,
    CREATE: "/packages",
    UPDATE: (id: number) => `/packages/${id}`,
    DELETE: (id: number) => `/packages/${id}`,
  },
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DRAWER_WIDTH: 280,
  DRAWER_WIDTH_COLLAPSED: 64,
  HEADER_HEIGHT: 64,
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300,
} as const;

// Status Options
export const STATUS_OPTIONS = {
  ACCOUNT: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ],
  SURVEY: [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
  ],
  PAYMENT: [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ],
  INVOICE: [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" },
  ],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  DISPLAY_WITH_TIME: "MMM DD, YYYY HH:mm",
  INPUT: "YYYY-MM-DD",
  API: "YYYY-MM-DD HH:mm:ss",
  TIMESTAMP: "YYYY-MM-DD HH:mm:ss.SSS",
} as const;

// Environment
export const ENV = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  ENABLE_MOCK_API: true, // Temporarily forced to true for debugging - was: import.meta.env.VITE_ENABLE_MOCK_API === "true",
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === "true",
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === "true",
  ITEMS_PER_PAGE: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 25,
  MAX_UPLOAD_SIZE: parseInt(import.meta.env.VITE_MAX_UPLOAD_SIZE) || 10485760, // 10MB
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || "support@inqwise.com",
  COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME || "Inqwise Ltd",
} as const;

// Debug logging for environment variables
console.log("Environment variables loaded:", {
  VITE_ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API,
  ENABLE_MOCK_API: ENV.ENABLE_MOCK_API,
  API_BASE_URL: ENV.API_BASE_URL,
  ENABLE_DEBUG: ENV.ENABLE_DEBUG,
});

// Colors - Matching original JSP application
export const COLORS = {
  PRIMARY: "#324E8D", // Original primary link color
  SECONDARY: "#f7931e", // Original link hover color
  SUCCESS: "#67A54B", // Original green button color
  WARNING: "#FFBF4A", // Original yellow button color
  ERROR: "#BA0A1C", // Original error color
  INFO: "#324E8D",

  // Additional original colors
  BACKGROUND: "#E9EAED", // Original body background
  HEADER_BG: "#ECEFF6", // Original header background
  NAV_HOVER: "#2E3C5C", // Original navigation hover
  NAV_TAB: "#3b5998", // Original navigation tab color
  TABLE_HEADER: "#f4f4f4", // Original table header
  BORDER_LIGHT: "#E2E2E2", // Light border color
  BORDER_STRONG: "#BBBBBB", // Strong border color
  TEXT_PRIMARY: "#333333", // Primary text color
  TEXT_SECONDARY: "#5c5c5c", // Secondary text color
  TEXT_MUTED: "#999999", // Muted text color
  BUTTON_BLUE_GRADIENT_START: "#8A9CC2",
  BUTTON_BLUE_GRADIENT_END: "#6D84B4",
  BUTTON_GREEN_GRADIENT_START: "#98C286",
  BUTTON_GREEN_GRADIENT_END: "#67A54B",
} as const;

// Chart Colors - Updated to match original theme
export const CHART_COLORS = [
  "#324E8D",
  "#f7931e",
  "#67A54B",
  "#FFBF4A",
  "#BA0A1C",
  "#3b5998",
  "#2E3C5C",
  "#5c5c5c",
  "#8A9CC2",
  "#6D84B4",
  "#98C286",
  "#609946",
] as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "opinion_admin_token",
  REFRESH_TOKEN: "opinion_admin_refresh_token",
  USER_PREFERENCES: "opinion_admin_preferences",
  THEME: "opinion_admin_theme",
  SIDEBAR_STATE: "opinion_admin_sidebar",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Internal server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNKNOWN_ERROR: "An unknown error occurred.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: "Successfully created.",
  UPDATED: "Successfully updated.",
  DELETED: "Successfully deleted.",
  SAVED: "Changes saved successfully.",
  LOGIN_SUCCESS: "Login successful.",
  LOGOUT_SUCCESS: "Logout successful.",
} as const;

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  USERS: "/users",
  USER_DETAILS: "/users/:id",
  ACCOUNTS: "/accounts",
  ACCOUNT_DETAILS: "/accounts/:id",
  SURVEYS: "/surveys",
  SURVEY_DETAILS: "/surveys/:id",
  POLLS: "/polls",
  POLL_DETAILS: "/polls/:id",
  COLLECTORS: "/collectors",
  COLLECTOR_DETAILS: "/collectors/:id",
  PAYMENTS: "/payments",
  INVOICES: "/invoices",
  INVOICE_DETAILS: "/invoices/:id",
  CREATE_INVOICE: "/invoices/new",
  BILLING_INVOICES: "/billing/invoices", // Standalone billing invoices page
  INVOICE_LIST: "/billing/invoice-list", // Invoice list with tabs for invoices and uninvoiced
  BILLING: "/billing",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  SYSTEM_EVENTS: "/system/events",
  SETUP: "/setup",
  SETUP_PLANS: "/setup/plans",
  PLAN_DETAILS: "/setup/plans/:id",
} as const;

// Navigation Menu Items
export interface MenuItemType {
  key: string;
  label: string;
  path: string;
  icon: string;
  children?: MenuItemType[];
}

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: "Dashboard",
  },
  {
    key: "users",
    label: "Users",
    path: ROUTES.USERS,
    icon: "People",
  },
  {
    key: "accounts",
    label: "Accounts",
    path: ROUTES.ACCOUNTS,
    icon: "Business",
  },
  {
    key: "surveys",
    label: "Surveys",
    path: ROUTES.SURVEYS,
    icon: "Poll",
  },
  {
    key: "collectors",
    label: "Collectors",
    path: ROUTES.COLLECTORS,
    icon: "CollectionsBookmark",
  },
  {
    key: "billing",
    label: "Billing",
    path: ROUTES.BILLING_INVOICES,
    icon: "Payment",
  },

  {
    key: "setup",
    label: "System",
    path: ROUTES.SETUP,
    icon: "Settings",
    children: [
      {
        key: "plans",
        label: "Plans",
        path: ROUTES.SETUP_PLANS,
        icon: "Receipt",
      },
      {
        key: "jobs",
        label: "Jobs",
        path: "/setup/jobs",
        icon: "Work",
      },
      {
        key: "system-events",
        label: "System Events",
        path: ROUTES.SYSTEM_EVENTS,
        icon: "Event",
      },
    ],
  },
];

// User Roles
export const USER_ROLES = [
  "user",
  "admin",
  "moderator",
  "analyst",
  "editor",
  "viewer",
] as const;

// Locales
export const LOCALES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es-ES", name: "Español" },
  { code: "fr-FR", name: "Français" },
  { code: "de-DE", name: "Deutsch" },
  { code: "it-IT", name: "Italiano" },
  { code: "pt-PT", name: "Português" },
  { code: "ru-RU", name: "Русский" },
  { code: "zh-CN", name: "中文 (简体)" },
  { code: "ja-JP", name: "日本語" },
  { code: "ko-KR", name: "한국어" },
  { code: "ar-SA", name: "العربية" },
] as const;

// Timezones
export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "America/Denver",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Moscow",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Seoul",
  "Asia/Mumbai",
  "Asia/Dubai",
  "Asia/Jerusalem",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
] as const;
