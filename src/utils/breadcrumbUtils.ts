import { BreadcrumbItem } from '../components/common/Breadcrumb';
import { ROUTES } from '../constants';

// Interface for route configuration
interface RouteConfig {
  path: string;
  label: string;
  parent?: string;
  dynamic?: boolean; // For routes with parameters like /users/:id
}

// Route configurations for breadcrumb generation
const routeConfigs: RouteConfig[] = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard' },
  { path: ROUTES.USERS, label: 'Users' },
  { path: ROUTES.USER_DETAILS, label: 'User Details', parent: ROUTES.USERS, dynamic: true },
  { path: ROUTES.ACCOUNTS, label: 'Accounts' },
  { path: ROUTES.ACCOUNT_DETAILS, label: 'Account Details', parent: ROUTES.ACCOUNTS, dynamic: true },
  { path: ROUTES.SURVEYS, label: 'Surveys' },
  { path: ROUTES.POLLS, label: 'Polls' },
  { path: ROUTES.COLLECTORS, label: 'Collectors' },
  { path: ROUTES.COLLECTOR_DETAILS, label: 'Collector Details', parent: ROUTES.COLLECTORS, dynamic: true },
  { path: '/accounts/:accountId/collectors/:collectorId', label: 'Collector Details', dynamic: true },
  { path: ROUTES.PAYMENTS, label: 'Payments' },
  { path: ROUTES.REPORTS, label: 'Reports' },
  { path: ROUTES.SETTINGS, label: 'Settings' },
  { path: ROUTES.SETUP, label: 'System' },
  { path: ROUTES.SETUP_PLANS, label: 'Plans', parent: ROUTES.SETUP },
  { path: ROUTES.PLAN_DETAILS, label: 'Plan Details', parent: ROUTES.SETUP_PLANS, dynamic: true },
  { path: ROUTES.SYSTEM_EVENTS, label: 'System Events', parent: ROUTES.SETUP },
  { path: '/setup/jobs', label: 'Jobs', parent: ROUTES.SETUP },
  { path: '/navigation', label: 'Navigation Guide' },
];

// Function to get route config by path
const getRouteConfig = (pathname: string): RouteConfig | null => {
  // First, try exact match
  let config = routeConfigs.find(route => route.path === pathname);
  
  if (config) {
    return config;
  }

  // If not found, try to match dynamic routes
  for (const route of routeConfigs) {
    if (route.dynamic) {
      // Convert route pattern like /users/:id to regex
      const pattern = route.path.replace(/:\w+/g, '\\d+');
      const regex = new RegExp(`^${pattern}$`);
      
      if (regex.test(pathname)) {
        return route;
      }
    }
  }

  return null;
};

// Function to build breadcrumb trail
const buildBreadcrumbTrail = (currentPath: string): RouteConfig[] => {
  const trail: RouteConfig[] = [];
  const config = getRouteConfig(currentPath);

  if (!config) {
    return trail;
  }

  // Build trail by following parent relationships
  const visited = new Set<string>();
  let current: RouteConfig | null = config;

  while (current && !visited.has(current.path)) {
    visited.add(current.path);
    trail.unshift(current);

    if (current.parent) {
      current = routeConfigs.find(route => route.path === current!.parent) || null;
    } else {
      break;
    }
  }

  return trail;
};

// Main function to generate breadcrumbs from current location
export const generateBreadcrumbs = (pathname: string, customItems?: BreadcrumbItem[]): BreadcrumbItem[] => {
  // If custom items are provided, use them
  if (customItems && customItems.length > 0) {
    return customItems;
  }

  // Generate automatic breadcrumbs
  const trail = buildBreadcrumbTrail(pathname);
  
  if (trail.length === 0) {
    return [];
  }

  // Convert route configs to breadcrumb items
  return trail.map((config, index) => {
    const isLast = index === trail.length - 1;
    
    return {
      label: config.label,
      path: isLast ? undefined : config.path, // Last item shouldn't be clickable
    };
  });
};

// Function to generate breadcrumbs for user details page with user name and tab
export const generateUserDetailsBreadcrumbs = (userName: string, currentTab?: string): BreadcrumbItem[] => {
  const tabLabels: Record<string, string> = {
    'details': 'User Details',
    'messages': 'Messages',
    'accounts': 'Related Accounts',
    'history': 'History',
    'password': 'Password Reset',
  };
  
  const tabLabel = currentTab ? tabLabels[currentTab] || 'User Details' : 'User Details';
  
  return [
    {
      label: 'Users',
      path: ROUTES.USERS,
    },
    {
      label: userName,
      path: undefined, // Not clickable
    },
    {
      label: tabLabel,
    },
  ];
};

// Function to generate breadcrumbs for account details page with account name and tab
export const generateAccountDetailsBreadcrumbs = (accountName: string, currentTab?: string): BreadcrumbItem[] => {
  const tabLabels: Record<string, string> = {
    'details': 'Account Details',
    'users': 'Users',
    'surveys': 'Surveys',
    'collectors': 'Collectors',
    'billing': 'Billing',
    'transactions': 'Transaction History',
    'payment': 'Make a Payment',
    'charges': 'Charges',
    'recurring': 'Recurring',
    'uninvoiced': 'UnInvoiced List',
    'invoices': 'Invoices',
  };
  
  const tabLabel = currentTab ? tabLabels[currentTab] || 'Account Details' : 'Account Details';
  
  return [
    {
      label: 'Accounts',
      path: ROUTES.ACCOUNTS,
    },
    {
      label: accountName,
      path: undefined, // Not clickable
    },
    {
      label: tabLabel,
    },
  ];
};

// Function to generate breadcrumbs for standalone collector details page
export const generateCollectorDetailsBreadcrumbs = (collectorName: string, accountName?: string): BreadcrumbItem[] => {
  return [
    {
      label: 'Collectors',
      path: ROUTES.COLLECTORS,
    },
    {
      label: collectorName,
      path: undefined, // Not clickable
    },
  ];
};

// Function to generate breadcrumbs for account collector details page
export const generateAccountCollectorDetailsBreadcrumbs = (accountName: string, collectorName: string): BreadcrumbItem[] => {
  // Extract account ID from current URL path for navigation
  const currentPath = window.location.pathname;
  const accountIdMatch = currentPath.match(/\/accounts\/(\d+)/);
  const accountId = accountIdMatch ? accountIdMatch[1] : '';
  
  return [
    {
      label: 'Accounts',
      path: ROUTES.ACCOUNTS,
    },
    {
      label: accountName,
      path: `/accounts/${accountId}`, // Make account name clickable to go back to account
    },
    {
      label: 'Collectors',
      path: `/accounts/${accountId}?tab=collectors`, // Make this go to account collectors tab
    },
    {
      label: collectorName,
      path: undefined, // Not clickable (current page)
    },
  ];
};

// Function to generate page title from breadcrumbs
export const generatePageTitle = (breadcrumbs: BreadcrumbItem[]): string => {
  if (breadcrumbs.length === 0) {
    return 'Admin Dashboard';
  }
  
  // Use the last breadcrumb item as the page title
  const lastItem = breadcrumbs[breadcrumbs.length - 1];
  return lastItem.label;
};

// Hook-like function to get breadcrumbs based on current route and optional data
export const useBreadcrumbs = (pathname: string, data?: { 
  userName?: string; 
  accountName?: string; 
  collectorName?: string;
  currentTab?: string;
  customItems?: BreadcrumbItem[];
}): BreadcrumbItem[] => {
  // Handle custom items first
  if (data?.customItems) {
    return data.customItems;
  }

  // Handle specific dynamic routes
  if (pathname.startsWith('/users/') && pathname !== '/users' && data?.userName) {
    return generateUserDetailsBreadcrumbs(data.userName, data.currentTab);
  }

  if (pathname.startsWith('/accounts/') && pathname !== '/accounts' && data?.accountName) {
    // Handle account collector details page
    if (pathname.includes('/collectors/') && data.collectorName) {
      return generateAccountCollectorDetailsBreadcrumbs(data.accountName, data.collectorName);
    }
    // Handle regular account details page
    return generateAccountDetailsBreadcrumbs(data.accountName, data.currentTab);
  }

  // Handle standalone collector details page
  if (pathname.startsWith('/collectors/') && pathname !== '/collectors' && data?.collectorName) {
    return generateCollectorDetailsBreadcrumbs(data.collectorName, data.accountName);
  }

  // Fall back to automatic generation
  return generateBreadcrumbs(pathname);
};
