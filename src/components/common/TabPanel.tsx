import React from 'react';
import { Box } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  id?: string;
  className?: string;
  sx?: object;
}

/**
 * Reusable TabPanel component with proper accessibility attributes
 * Replaces the multiple duplicate TabPanel implementations across the app
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  id,
  className,
  sx = {},
  ...other
}) => {
  const tabPanelId = id || `tabpanel-${index}`;
  const tabId = id ? `${id}-tab-${index}` : `tab-${index}`;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={tabPanelId}
      aria-labelledby={tabId}
      className={className}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2, ...sx }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * Helper function for generating accessibility props for Tab components
 */
export const a11yProps = (index: number, id?: string) => {
  const tabId = id ? `${id}-tab-${index}` : `tab-${index}`;
  const tabPanelId = id ? `${id}-tabpanel-${index}` : `tabpanel-${index}`;
  
  return {
    id: tabId,
    'aria-controls': tabPanelId,
  };
};

export default TabPanel;
