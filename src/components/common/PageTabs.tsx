import React, { useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { useSetBreadcrumbs } from '../../contexts/BreadcrumbContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`page-tabpanel-${index}`}
      aria-labelledby={`page-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box 
          sx={{ 
            py: { xs: 2, sm: 3 }, 
            px: { xs: 1, sm: 0 }, // Add horizontal padding on mobile
            // Ensure content doesn't overflow
            overflowX: 'auto',
            width: '100%',
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Tab definition interface for PageTabs component
 */
export interface TabDefinition {
  /** Display label for the tab */
  label: string;
  /** URL parameter key (e.g., 'details', 'messages') - should be lowercase and URL-friendly */
  key: string;
  /** React component to render in the tab panel */
  component: ReactNode;
}

/**
 * Props interface for PageTabs component
 */
interface PageTabsProps {
  /** Array of tab configurations */
  tabs: TabDefinition[];
  /** Entity name for breadcrumb integration (e.g., user name, account name) */
  entityName?: string;
  /** Index of the default active tab */
  defaultTab?: number;
  /** Error message to display */
  error?: string | null;
  /** Success message to display */
  success?: string | null;
  /** Callback when error alert is closed */
  onErrorClose?: () => void;
  /** Callback when success alert is closed */
  onSuccessClose?: () => void;
  /** CSS class name for the container */
  className?: string;
  /** Material-UI sx props for additional styling */
  sx?: any;
}

/**
 * A reusable tabbed interface component that provides URL synchronization, 
 * breadcrumb integration, and consistent styling across the application.
 * 
 * Features:
 * - URL synchronization with browser history
 * - Automatic breadcrumb updates
 * - Built-in success/error message handling
 * - Mobile-responsive scrollable tabs
 * - TypeScript support
 * 
 * @example
 * ```typescript
 * const tabs: TabDefinition[] = [
 *   { key: 'overview', label: 'Overview', component: <OverviewTab /> },
 *   { key: 'settings', label: 'Settings', component: <SettingsTab /> }
 * ];
 * 
 * <PageTabs 
 *   tabs={tabs} 
 *   entityName="User Profile"
 *   error={error}
 *   success={success}
 *   onErrorClose={() => setError(null)}
 *   onSuccessClose={() => setSuccess(null)}
 * />
 * ```
 */
const PageTabs: React.FC<PageTabsProps> = ({
  tabs,
  entityName,
  defaultTab = 0,
  error,
  success,
  onErrorClose,
  onSuccessClose,
  className,
  sx,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setBreadcrumbData } = useSetBreadcrumbs();

  // Extract tab keys for URL mapping
  const tabKeys = tabs.map(tab => tab.key);

  // Get active tab from URL parameters
  const getActiveTabFromUrl = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabIndex = tabKeys.indexOf(tabParam);
      return tabIndex >= 0 ? tabIndex : defaultTab;
    }
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl);

  // Handle tab change and URL synchronization
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Update URL with new tab parameter
    const newSearchParams = new URLSearchParams(searchParams);
    if (newValue === defaultTab) {
      // Remove tab parameter for default tab
      newSearchParams.delete('tab');
    } else {
      newSearchParams.set('tab', tabKeys[newValue]);
    }
    setSearchParams(newSearchParams);
    
    // Update breadcrumb with current tab
    if (entityName) {
      setBreadcrumbData({
        ...(entityName.includes('Name') ? {} : { entityName }),
        currentTab: tabKeys[newValue]
      });
    }
  };

  // Effect to sync activeTab with URL on component mount and URL changes
  useEffect(() => {
    const tabFromUrl = getActiveTabFromUrl();
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
      
      // Update breadcrumb with current tab whenever tab changes
      if (entityName) {
        setBreadcrumbData({
          ...(entityName.includes('Name') ? {} : { entityName }),
          currentTab: tabKeys[tabFromUrl]
        });
      }
    }
  }, [searchParams]);

  return (
    <Box 
      className={className} 
      sx={{
        width: '100%',
        // Ensure proper responsive behavior
        minWidth: 0, // Allow shrinking
        overflowX: 'hidden', // Prevent horizontal overflow
        ...sx
      }}
    >
      
      {/* Success/Error Messages */}
      {error && (
        <Alert 
          severity="error" 
          onClose={onErrorClose} 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          onClose={onSuccessClose} 
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',  // Prevent uppercase transformation
              minWidth: { xs: 60, sm: 80 },  // Further reduced min width
              maxWidth: { xs: 100, sm: 120 },  // Further reduced max width
              fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Restored original font size
              padding: { xs: '4px 6px', sm: '6px 8px' }, // Much tighter padding
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            '& .MuiTabs-scrollButtons': {
              '&.Mui-disabled': {
                display: 'none',
              },
            },
            '& .MuiTabs-scroller': {
              // Ensure smooth scrolling on mobile
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none',
            },
            // Responsive adjustments for mobile
            '@media (max-width: 600px)': {
              '& .MuiTab-root': {
                minWidth: 50,  // Very compact for mobile
                maxWidth: 80, // Very compact for mobile
                fontSize: '0.7rem', // Restored closer to original
                padding: '3px 4px', // Very tight padding for mobile
              },
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={tab.key} 
              label={tab.label}
              sx={{
                // Very tight spacing
                minHeight: { xs: 32, sm: 40 }, // Much reduced height
                '& .MuiTab-label': {
                  lineHeight: 1.1, // Slightly more readable line height
                  '@media (max-width: 480px)': {
                    fontSize: '0.65rem', // Restored closer to original
                  },
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {tabs.map((tab, index) => (
        <TabPanel key={tab.key} value={activeTab} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default PageTabs;
