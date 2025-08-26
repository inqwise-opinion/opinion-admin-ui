import React from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { TabPanel, a11yProps } from './TabPanel';

export interface TabConfig {
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabContainerProps {
  tabs: TabConfig[];
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  id?: string;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  tabsClassName?: string;
  panelClassName?: string;
  sx?: object;
  tabsSx?: object;
  panelSx?: object;
  paper?: boolean;
  divider?: boolean;
}

/**
 * Standardized TabContainer component that combines Tabs and TabPanels
 * with consistent styling and accessibility features
 */
export const TabContainer: React.FC<TabContainerProps> = ({
  tabs,
  value,
  onChange,
  id = 'tab-container',
  variant = 'standard',
  orientation = 'horizontal',
  className,
  tabsClassName,
  panelClassName,
  sx = {},
  tabsSx = {},
  panelSx = {},
  paper = false,
  divider = true,
}) => {
  const tabsContent = (
    <Box 
      className={className}
      sx={{
        ...(divider && { borderBottom: 1, borderColor: 'divider' }),
        ...sx
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        variant={variant === 'scrollable' ? 'scrollable' : variant}
        orientation={orientation}
        scrollButtons={variant === 'scrollable' ? 'auto' : false}
        allowScrollButtonsMobile={variant === 'scrollable'}
        className={tabsClassName}
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            minWidth: 'auto',
          },
          ...tabsSx
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            disabled={tab.disabled}
            {...a11yProps(index, id)}
          />
        ))}
      </Tabs>
    </Box>
  );

  const panelsContent = (
    <Box className={panelClassName} sx={panelSx}>
      {tabs.map((tab, index) => (
        <TabPanel
          key={index}
          value={value}
          index={index}
          id={id}
        >
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );

  if (paper) {
    return (
      <Paper sx={{ width: '100%' }}>
        {tabsContent}
        {panelsContent}
      </Paper>
    );
  }

  return (
    <>
      {tabsContent}
      {panelsContent}
    </>
  );
};

export default TabContainer;
