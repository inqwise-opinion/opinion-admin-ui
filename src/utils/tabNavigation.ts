/**
 * Utility functions for managing tab navigation and URL state persistence
 */

export const TAB_NAMES = [
  'details',
  'users', 
  'surveys',
  'collectors',
  'billing',
  'transactions',
  'payment',
  'charges',
  'recurring',
  'uninvoiced',
  'invoices'
] as const;

export type TabName = typeof TAB_NAMES[number];

/**
 * Get the active tab index from URL search parameters
 */
export function getActiveTabFromUrl(
  searchParams: URLSearchParams,
  tabNames: readonly string[] = TAB_NAMES,
  paramName: string = 'tab'
): number {
  const tabParam = searchParams.get(paramName);
  if (tabParam) {
    const tabIndex = tabNames.indexOf(tabParam);
    return tabIndex >= 0 ? tabIndex : 0;
  }
  return 0;
}

/**
 * Update URL search parameters with the new tab
 */
export function updateUrlWithTab(
  searchParams: URLSearchParams, 
  tabIndex: number,
  tabNames: readonly string[] = TAB_NAMES,
  paramName: string = 'tab'
): URLSearchParams {
  const newSearchParams = new URLSearchParams(searchParams);
  
  if (tabIndex === 0) {
    // Remove tab parameter for default tab (details)
    newSearchParams.delete(paramName);
  } else if (tabIndex < tabNames.length) {
    newSearchParams.set(paramName, tabNames[tabIndex]);
  }
  
  return newSearchParams;
}

/**
 * Get tab name by index
 */
export function getTabName(index: number): TabName | undefined {
  return TAB_NAMES[index];
}

/**
 * Get tab index by name
 */
export function getTabIndex(name: string): number {
  const index = TAB_NAMES.indexOf(name as TabName);
  return index >= 0 ? index : 0;
}
