import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import UsersPage from "./pages/users/UsersPage";
import AccountsPage from "./pages/accounts/AccountsPage";
import AccountDetailsPage from "./pages/accounts/AccountDetailsPage";
import UserDetailsPage from "./pages/users/UserDetailsPage";
import InvoicesPage from "./pages/invoices/InvoicesPage";
import InvoiceDetailsPage from "./pages/invoices/InvoiceDetailsPage";
import CreateInvoicePage from "./pages/invoices/CreateInvoicePage";
import InvoiceListPage from "./pages/invoices/InvoiceListPage";
import BillingInvoicesPage from "./pages/InvoicesPage"; // Standalone billing invoices page
import SurveysPage from "./pages/surveys/SurveysPage";
import SurveyDetailsPage from "./pages/surveys/SurveyDetailsPage";
import AccountSurveyDetailsPage from "./pages/accounts/AccountSurveyDetailsPage";
import CollectorsPage from "./pages/collectors/CollectorsPage";
import CollectorDetailsPage from "./pages/collectors/CollectorDetailsPage";
import AccountCollectorDetailsPage from "./pages/accounts/AccountCollectorDetailsPage";
import SetupPage from "./pages/setup/SetupPage";
import PlansPage from "./pages/setup/PlansPage";
import SystemEventsPage from "./pages/SystemEventsPage";
import JobsPage from "./pages/setup/JobsPage";
import NavigationDemo from "./pages/NavigationDemo";
import ViewEditFormDemo from "./pages/demo/ViewEditFormDemo";
import { BreadcrumbProvider } from "./contexts/BreadcrumbContext";
import { ROUTES, COLORS } from "./constants";

// Create Material-UI theme to match original JSP application
const theme = createTheme({
  palette: {
    primary: {
      main: "#324E8D", // Original primary link color
      dark: "#2E3C5C", // Navigation hover color
      light: "#3b5998", // Navigation tab color
    },
    secondary: {
      main: "#f7931e", // Original link hover color
    },
    success: {
      main: "#67A54B", // Original green button color
    },
    warning: {
      main: "#FFBF4A", // Original yellow button color
    },
    error: {
      main: "#BA0A1C", // Original error color
    },
    info: {
      main: "#324E8D",
    },
    background: {
      default: "#E9EAED", // Original body background
      paper: "#FFFFFF", // Content background
    },
    grey: {
      50: "#f9f9f9",
      100: "#f4f4f4", // Table header background
      200: "#ECEFF6", // Header background
      300: "#E2E2E2", // Border color
      400: "#BBBBBB", // Strong border color
      500: "#999999", // Muted text
      600: "#666666", // Input border top
      700: "#333333", // Main text color
      800: "#222222", // Dark text
    },
  },
  typography: {
    fontFamily: "arial, helvetica, sans-serif", // Original font family
    fontSize: 15, // Increased base font size for better readability (+1)
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: "25px", // Increased from 24px (+1)
      fontWeight: "bold",
      lineHeight: "33px",
      color: "#333",
      paddingBottom: "20px",
    },
    h2: {
      fontSize: "19px", // Increased from 18px (+1)
      fontWeight: "bold",
      color: "#333",
    },
    h3: {
      fontSize: "17px", // Increased from 16px (+1)
      fontWeight: "bold",
      color: "#333",
    },
    h4: {
      fontSize: "15px", // Increased from 14px (+1)
      color: "#5c5c5c",
      fontWeight: "normal",
    },
    h5: {
      fontSize: "15px", // Increased from 14px (+1)
      color: "#5c5c5c",
      fontWeight: "normal",
    },
    h6: {
      fontSize: "15px", // Increased from 14px (+1)
      fontWeight: 600,
    },
    body1: {
      fontSize: "15px", // Increased from 14px (+1)
      lineHeight: 1.5,
      color: "#222",
    },
    body2: {
      fontSize: "14px", // Increased from 13px (+1)
      color: "#333",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*, *::before, *::after": {
          boxSizing: "border-box",
        },
        html: {
          width: "100%",
          height: "100%",
          overflowX: "hidden", // Prevent horizontal scroll
        },
        body: {
          backgroundColor: "#E9EAED",
          color: "#222",
          fontSize: "15px", // Increased from 14px (+1)
          fontFamily: "arial, helvetica, sans-serif",
          lineHeight: 1.5,
          width: "100%",
          minWidth: 0, // Allow shrinking
          maxWidth: "100vw", // Prevent overflow
          overflowX: "hidden", // Prevent horizontal scroll
          margin: 0,
          padding: 0,
        },
        "#root": {
          width: "100%",
          minWidth: 0, // Allow shrinking
          maxWidth: "100vw", // Prevent overflow
          overflowX: "hidden", // Prevent horizontal scroll
        },
        a: {
          color: "#324E8D",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
            color: "#f7931e",
          },
        },
        // Header table styles
        ".placeholder-header": {
          width: "100%",
          borderSpacing: 0,
          borderCollapse: "collapse",
        },
        ".cell-left": {
          textAlign: "left",
          verticalAlign: "middle",
        },
        ".cell-right": {
          textAlign: "right",
          verticalAlign: "middle",
        },
        ".content-container": {
          padding: 0,
          width: "100%",
          minWidth: 0, // Allow content to shrink
          overflowX: "hidden", // Prevent horizontal scroll
        },
        // Responsive table fixes
        ".MuiDataGrid-root": {
          "@media (max-width: 768px)": {
            minWidth: 0,
            "& .MuiDataGrid-columnHeaders": {
              minWidth: 0,
            },
            "& .MuiDataGrid-virtualScroller": {
              minWidth: 0,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ECEFF6",
          color: "#333",
          borderBottom: "1px solid #DEDEDE",
          boxShadow: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ECEFF6",
          borderRight: "1px solid #DEDEDE",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#324E8D",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#2E3C5C",
            },
            "& .MuiListItemIcon-root": {
              color: "#ffffff",
            },
            "& .MuiListItemText-primary": {
              color: "#ffffff",
              fontWeight: "bold",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(50, 78, 141, 0.08)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: "bold",
          fontSize: "11px",
          padding: "2px 6px",
        },
        containedPrimary: {
          backgroundColor: "#324E8D",
          color: "#ffffff",
          border: "1px solid #29447E",
          textShadow: "0 1px 1px #29447E",
          background: "linear-gradient(to bottom, #8A9CC2, #6D84B4)",
          "&:hover": {
            backgroundColor: "#2E3C5C",
            background: "linear-gradient(to bottom, #6D84B4, #4F6AA3)",
          },
        },
        containedSecondary: {
          backgroundColor: "#67A54B",
          color: "#ffffff",
          border: "1px solid #3B6E22",
          textShadow: "0 1px 1px #3B6E22",
          background: "linear-gradient(to bottom, #98C286, #67A54B)",
          "&:hover": {
            backgroundColor: "#609946",
            background: "linear-gradient(to bottom, #67A54B, #609946)",
          },
        },
        outlined: {
          backgroundColor: "#e5e5e5",
          color: "#333",
          border: "1px solid #999999",
          textShadow: "0 1px 0 #fff",
          background: "linear-gradient(to bottom, #f9f9f9, #e5e5e5)",
          "&:hover": {
            backgroundColor: "#ddd",
            background: "linear-gradient(to bottom, #e5e5e5, #dddddd)",
          },
        },
      },
      variants: [
        // Add/New Item Button - Green button for opening new item forms
        {
          props: { variant: 'contained', color: 'success', className: 'btn-add' },
          style: {
            backgroundColor: '#4CAF50',
            color: '#ffffff',
            textTransform: 'none',
            fontSize: '14px',
            padding: '8px 16px',
            minHeight: '36px',
            fontWeight: 'normal',
            '&:hover': {
              backgroundColor: '#45a049',
            },
          },
        },
        // Action Button - For Create/Update/OK/Assign operations
        {
          props: { variant: 'contained', className: 'btn-action' },
          style: {
            textTransform: 'none',
            fontSize: '14px',
            padding: '8px 16px',
            minHeight: '36px',
            fontWeight: 'normal',
          },
        },
        // Cancel Button - Gray outlined button for cancel operations
        {
          props: { variant: 'outlined', className: 'btn-cancel' },
          style: {
            textTransform: 'none',
            fontSize: '14px',
            padding: '8px 16px',
            minHeight: '36px',
            borderColor: '#d1d5db',
            color: '#374151',
            fontWeight: 'normal',
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        elevation1: {
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            fontSize: "15px", // Increased from 14px (+1)
            "& fieldset": {
              borderColor: "#ccc",
              borderTopColor: "#666666",
              borderLeftColor: "#666666",
            },
            "&:hover fieldset": {
              borderColor: "#A0A0A0",
              borderRightColor: "#B9B9B9",
              borderBottomColor: "#B9B9B9",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1) inset",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#507EC7",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3) inset",
            },
          },
          "& .MuiInputLabel-root": {
            fontSize: "15px", // Label font size (+1)
          },
        },
      },
    },
  },
});

// Placeholder components for routes
const Users = () => (
  <div>
    <h1>Users</h1>
    <p>Users page will be implemented next...</p>
  </div>
);

const Accounts = () => (
  <div>
    <h1>Accounts</h1>
    <p>Accounts page will be implemented next...</p>
  </div>
);

// Surveys component is now imported as SurveysPage

const Polls = () => (
  <div>
    <h1>Polls</h1>
    <p>Polls page will be implemented next...</p>
  </div>
);

const Payments = () => (
  <div>
    <h1>Payments</h1>
    <p>Payments page will be implemented next...</p>
  </div>
);

const Reports = () => (
  <div>
    <h1>Reports</h1>
    <p>Reports page will be implemented next...</p>
  </div>
);



const Settings = () => (
  <div>
    <h1>Settings</h1>
    <p>Settings page will be implemented next...</p>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BreadcrumbProvider>
        <Router>
          <Routes>
            {/* Redirect root to dashboard */}
            <Route
              path={ROUTES.HOME}
              element={<Navigate to={ROUTES.DASHBOARD} replace />}
            />

            {/* Main application routes */}
            <Route path="/" element={<MainLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.USERS} element={<UsersPage />} />
              <Route path={ROUTES.USER_DETAILS} element={<UserDetailsPage />} />
              <Route path={ROUTES.ACCOUNTS} element={<AccountsPage />} />
              <Route
                path={ROUTES.ACCOUNT_DETAILS}
                element={<AccountDetailsPage />}
              />
              <Route path={ROUTES.SURVEYS} element={<SurveysPage />} />
              <Route path={ROUTES.SURVEY_DETAILS} element={<SurveyDetailsPage />} />
              <Route path="/accounts/:accountId/surveys/:surveyId" element={<AccountSurveyDetailsPage />} />
              <Route path={ROUTES.POLLS} element={<Polls />} />
              <Route path={ROUTES.COLLECTORS} element={<CollectorsPage />} />
              <Route path={ROUTES.COLLECTOR_DETAILS} element={<CollectorDetailsPage />} />
              <Route path="/accounts/:accountId/collectors/:collectorId" element={<AccountCollectorDetailsPage />} />
              <Route path={ROUTES.BILLING} element={<Navigate to={ROUTES.BILLING_INVOICES} replace />} />
              <Route path={ROUTES.PAYMENTS} element={<Payments />} />
              <Route path={ROUTES.INVOICES} element={<InvoicesPage />} />
              <Route
                path={ROUTES.INVOICE_DETAILS}
                element={<InvoiceDetailsPage />}
              />
              <Route
                path={ROUTES.CREATE_INVOICE}
                element={<CreateInvoicePage />}
              />
              {/* <Route path={ROUTES.INVOICE_LIST} element={<InvoiceListPage />} /> */}
              <Route
                path={ROUTES.BILLING_INVOICES}
                element={<BillingInvoicesPage />}
              />
              <Route path={ROUTES.REPORTS} element={<Reports />} />
              <Route path={ROUTES.SYSTEM_EVENTS} element={<SystemEventsPage />} />
              <Route path={ROUTES.SETTINGS} element={<Settings />} />

              <Route path="setup" element={<SetupPage />} />
              <Route path="setup/plans" element={<PlansPage />} />
              <Route path="setup/plans/:id" element={<PlansPage />} />
              <Route path="setup/jobs" element={<JobsPage />} />
              <Route path="/navigation" element={<NavigationDemo />} />
              <Route path="/demo/view-edit-form" element={<ViewEditFormDemo />} />
            </Route>

            {/* Catch all route */}
            <Route
              path="*"
              element={<Navigate to={ROUTES.DASHBOARD} replace />}
            />
          </Routes>
        </Router>
      </BreadcrumbProvider>
    </ThemeProvider>
  );
};

export default App;
