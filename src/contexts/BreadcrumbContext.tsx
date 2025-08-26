import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BreadcrumbItem } from '../components/common/Breadcrumb';

interface BreadcrumbContextType {
  customBreadcrumbs: BreadcrumbItem[] | null;
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  clearBreadcrumbs: () => void;
  setBreadcrumbData: (data: { userName?: string; accountName?: string; collectorName?: string; currentTab?: string }) => void;
  breadcrumbData: { userName?: string; accountName?: string; collectorName?: string; currentTab?: string };
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

interface BreadcrumbProviderProps {
  children: ReactNode;
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({ children }) => {
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState<BreadcrumbItem[] | null>(null);
  const [breadcrumbData, setBreadcrumbDataState] = useState<{ userName?: string; accountName?: string; collectorName?: string; currentTab?: string }>({});
  const [pageTitle, setPageTitle] = useState<string>('Admin Dashboard');

  const setBreadcrumbs = useCallback((items: BreadcrumbItem[]) => {
    setCustomBreadcrumbs(items);
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setCustomBreadcrumbs(null);
    setBreadcrumbDataState({});
  }, []);

  const setBreadcrumbData = useCallback((data: { userName?: string; accountName?: string; collectorName?: string; currentTab?: string }) => {
    setBreadcrumbDataState(prev => ({ ...prev, ...data }));
  }, []);

  const value: BreadcrumbContextType = {
    customBreadcrumbs,
    setBreadcrumbs,
    clearBreadcrumbs,
    setBreadcrumbData,
    breadcrumbData,
    pageTitle,
    setPageTitle,
  };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbContext = (): BreadcrumbContextType => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbContext must be used within a BreadcrumbProvider');
  }
  return context;
};

// Hook for pages to easily set breadcrumbs and page title
export const useSetBreadcrumbs = () => {
  const { setBreadcrumbs, setBreadcrumbData, clearBreadcrumbs, setPageTitle } = useBreadcrumbContext();
  
  return {
    setBreadcrumbs,
    setBreadcrumbData,
    clearBreadcrumbs,
    setPageTitle,
  };
};
