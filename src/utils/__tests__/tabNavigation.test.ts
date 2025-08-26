/**
 * Unit tests for tab navigation utilities
 */

import { 
  getActiveTabFromUrl, 
  updateUrlWithTab, 
  getTabName, 
  getTabIndex,
  TAB_NAMES 
} from '../tabNavigation';

describe('tabNavigation', () => {
  describe('getActiveTabFromUrl', () => {
    it('should return 0 when no tab parameter is present', () => {
      const searchParams = new URLSearchParams('');
      expect(getActiveTabFromUrl(searchParams)).toBe(0);
    });

    it('should return correct index for valid tab names', () => {
      const searchParams = new URLSearchParams('tab=users');
      expect(getActiveTabFromUrl(searchParams)).toBe(1);
      
      const searchParams2 = new URLSearchParams('tab=surveys');
      expect(getActiveTabFromUrl(searchParams2)).toBe(2);
    });

    it('should return 0 for invalid tab names', () => {
      const searchParams = new URLSearchParams('tab=invalid');
      expect(getActiveTabFromUrl(searchParams)).toBe(0);
    });

    it('should handle multiple parameters', () => {
      const searchParams = new URLSearchParams('foo=bar&tab=billing&baz=qux');
      expect(getActiveTabFromUrl(searchParams)).toBe(4);
    });
  });

  describe('updateUrlWithTab', () => {
    it('should remove tab parameter for default tab (index 0)', () => {
      const searchParams = new URLSearchParams('tab=users&other=value');
      const result = updateUrlWithTab(searchParams, 0);
      
      expect(result.has('tab')).toBe(false);
      expect(result.get('other')).toBe('value');
    });

    it('should set tab parameter for non-default tabs', () => {
      const searchParams = new URLSearchParams('other=value');
      const result = updateUrlWithTab(searchParams, 1);
      
      expect(result.get('tab')).toBe('users');
      expect(result.get('other')).toBe('value');
    });

    it('should replace existing tab parameter', () => {
      const searchParams = new URLSearchParams('tab=surveys');
      const result = updateUrlWithTab(searchParams, 2);
      
      expect(result.get('tab')).toBe('surveys');
    });

    it('should preserve other search parameters', () => {
      const searchParams = new URLSearchParams('foo=bar&baz=qux');
      const result = updateUrlWithTab(searchParams, 3);
      
      expect(result.get('tab')).toBe('collectors');
      expect(result.get('foo')).toBe('bar');
      expect(result.get('baz')).toBe('qux');
    });
  });

  describe('getTabName', () => {
    it('should return correct tab name for valid indices', () => {
      expect(getTabName(0)).toBe('details');
      expect(getTabName(1)).toBe('users');
      expect(getTabName(2)).toBe('surveys');
    });

    it('should return undefined for invalid indices', () => {
      expect(getTabName(-1)).toBeUndefined();
      expect(getTabName(TAB_NAMES.length)).toBeUndefined();
      expect(getTabName(999)).toBeUndefined();
    });
  });

  describe('getTabIndex', () => {
    it('should return correct index for valid tab names', () => {
      expect(getTabIndex('details')).toBe(0);
      expect(getTabIndex('users')).toBe(1);
      expect(getTabIndex('surveys')).toBe(2);
    });

    it('should return 0 for invalid tab names', () => {
      expect(getTabIndex('invalid')).toBe(0);
      expect(getTabIndex('')).toBe(0);
    });
  });

  describe('TAB_NAMES constant', () => {
    it('should contain expected tab names in correct order', () => {
      expect(TAB_NAMES[0]).toBe('details');
      expect(TAB_NAMES[1]).toBe('users');
      expect(TAB_NAMES[2]).toBe('surveys');
      expect(TAB_NAMES.length).toBe(11);
    });
  });
});
