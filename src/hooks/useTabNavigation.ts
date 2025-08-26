/**
 * Custom hook for managing tab navigation with URL persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getActiveTabFromUrl, updateUrlWithTab } from '../utils/tabNavigation';

interface UseTabNavigationOptions {
  /** Custom tab names array. If not provided, uses default TAB_NAMES */
  tabNames?: readonly string[];
  /** Whether to persist tab state in URL. Default: true */
  persistInUrl?: boolean;
  /** Custom URL parameter name. Default: 'tab' */
  urlParamName?: string;
  /** Initial tab index. Default: 0 */
  initialTab?: number;
  /** Callback when tab changes */
  onTabChange?: (newTab: number, oldTab: number) => void;
}

export function useTabNavigation(options: UseTabNavigationOptions = {}) {
  const {
    tabNames,
    persistInUrl = true,
    urlParamName = 'tab',
    initialTab = 0,
    onTabChange
  } = options;
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL parameters or use initial tab
  const getInitialTab = useCallback(() => {
    if (persistInUrl) {
      return getActiveTabFromUrl(searchParams, tabNames, urlParamName);
    }
    return initialTab;
  }, [searchParams, tabNames, urlParamName, initialTab, persistInUrl]);
  
  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Effect to sync activeTab with URL on component mount and URL changes
  useEffect(() => {
    if (persistInUrl) {
      const tabFromUrl = getActiveTabFromUrl(searchParams, tabNames, urlParamName);
      if (tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [searchParams, activeTab, tabNames, urlParamName, persistInUrl]);

  // Handle tab change and URL synchronization
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    const oldValue = activeTab;
    setActiveTab(newValue);
    
    if (persistInUrl) {
      const newSearchParams = updateUrlWithTab(searchParams, newValue, tabNames, urlParamName);
      setSearchParams(newSearchParams);
    }
    
    // Call optional callback
    if (onTabChange) {
      onTabChange(newValue, oldValue);
    }
  }, [activeTab, persistInUrl, searchParams, setSearchParams, tabNames, urlParamName, onTabChange]);

  return {
    activeTab,
    handleTabChange,
    searchParams,
    setActiveTab: (tab: number) => {
      const oldValue = activeTab;
      setActiveTab(tab);
      if (onTabChange) {
        onTabChange(tab, oldValue);
      }
    },
  };
}
