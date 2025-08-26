/**
 * Unit tests for table utilities
 */

import { 
  sortUsers, 
  filterUsers, 
  paginate, 
  toggleSortDirection, 
  calculatePaginationInfo 
} from '../tableUtils';
import { User } from '../../types';

describe('tableUtils', () => {
  const mockUsers: User[] = [
    {
      userId: 1,
      userName: 'alice',
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      isActive: true,
      insertDate: '2025-01-15T10:00:00Z',
    } as User,
    {
      userId: 2,
      userName: 'bob',
      email: 'bob@test.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      isActive: false,
      insertDate: '2025-01-10T10:00:00Z',
    } as User,
    {
      userId: 3,
      userName: 'charlie',
      email: 'charlie@example.com',
      firstName: 'Charlie',
      lastName: 'Brown',
      isActive: true,
      insertDate: '2025-01-20T10:00:00Z',
    } as User,
  ];

  describe('sortUsers', () => {
    it('should sort by userId ascending', () => {
      const sorted = sortUsers(mockUsers, 'userId', 'asc');
      expect(sorted.map(u => u.userId)).toEqual([1, 2, 3]);
    });

    it('should sort by userId descending', () => {
      const sorted = sortUsers(mockUsers, 'userId', 'desc');
      expect(sorted.map(u => u.userId)).toEqual([3, 2, 1]);
    });

    it('should sort by userName ascending', () => {
      const sorted = sortUsers(mockUsers, 'userName', 'asc');
      expect(sorted.map(u => u.userName)).toEqual(['alice', 'bob', 'charlie']);
    });

    it('should sort by userName descending', () => {
      const sorted = sortUsers(mockUsers, 'userName', 'desc');
      expect(sorted.map(u => u.userName)).toEqual(['charlie', 'bob', 'alice']);
    });

    it('should sort by isActive ascending', () => {
      const sorted = sortUsers(mockUsers, 'isActive', 'asc');
      expect(sorted[0].isActive).toBe(false); // bob
      expect(sorted[1].isActive).toBe(true);  // alice
      expect(sorted[2].isActive).toBe(true);  // charlie
    });

    it('should sort by insertDate ascending', () => {
      const sorted = sortUsers(mockUsers, 'insertDate', 'asc');
      expect(sorted.map(u => u.userName)).toEqual(['bob', 'alice', 'charlie']);
    });

    it('should sort by insertDate descending', () => {
      const sorted = sortUsers(mockUsers, 'insertDate', 'desc');
      expect(sorted.map(u => u.userName)).toEqual(['charlie', 'alice', 'bob']);
    });

    it('should not mutate original array', () => {
      const originalOrder = [...mockUsers];
      sortUsers(mockUsers, 'userName', 'asc');
      expect(mockUsers).toEqual(originalOrder);
    });
  });

  describe('filterUsers', () => {
    it('should filter by username', () => {
      const filtered = filterUsers(mockUsers, 'alice');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].userName).toBe('alice');
    });

    it('should filter by email', () => {
      const filtered = filterUsers(mockUsers, 'test.com');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].email).toBe('bob@test.com');
    });

    it('should be case insensitive', () => {
      const filtered = filterUsers(mockUsers, 'ALICE');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].userName).toBe('alice');
    });

    it('should filter by partial matches', () => {
      const filtered = filterUsers(mockUsers, 'example.com');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(u => u.userName)).toEqual(['alice', 'charlie']);
    });

    it('should return all users for empty search term', () => {
      const filtered = filterUsers(mockUsers, '');
      expect(filtered).toEqual(mockUsers);
    });

    it('should return all users for whitespace-only search term', () => {
      const filtered = filterUsers(mockUsers, '   ');
      expect(filtered).toEqual(mockUsers);
    });

    it('should return empty array for no matches', () => {
      const filtered = filterUsers(mockUsers, 'nonexistent');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('paginate', () => {
    it('should return first page correctly', () => {
      const paginated = paginate(mockUsers, 0, 2);
      expect(paginated).toHaveLength(2);
      expect(paginated.map(u => u.userId)).toEqual([1, 2]);
    });

    it('should return second page correctly', () => {
      const paginated = paginate(mockUsers, 1, 2);
      expect(paginated).toHaveLength(1);
      expect(paginated.map(u => u.userId)).toEqual([3]);
    });

    it('should handle page size larger than array', () => {
      const paginated = paginate(mockUsers, 0, 10);
      expect(paginated).toEqual(mockUsers);
    });

    it('should return empty array for page beyond bounds', () => {
      const paginated = paginate(mockUsers, 10, 2);
      expect(paginated).toHaveLength(0);
    });

    it('should handle page size of 1', () => {
      const paginated = paginate(mockUsers, 1, 1);
      expect(paginated).toHaveLength(1);
      expect(paginated[0].userId).toBe(2);
    });
  });

  describe('toggleSortDirection', () => {
    it('should toggle direction for same field', () => {
      const newDirection = toggleSortDirection('userId', 'asc', 'userId');
      expect(newDirection).toBe('desc');
      
      const newDirection2 = toggleSortDirection('userId', 'desc', 'userId');
      expect(newDirection2).toBe('asc');
    });

    it('should return asc for different field', () => {
      const newDirection = toggleSortDirection('userId', 'desc', 'userName');
      expect(newDirection).toBe('asc');
    });
  });

  describe('calculatePaginationInfo', () => {
    it('should calculate pagination info correctly', () => {
      const info = calculatePaginationInfo(10, 1, 3);
      
      expect(info.totalItems).toBe(10);
      expect(info.totalPages).toBe(4); // Math.ceil(10/3)
      expect(info.currentPage).toBe(1);
      expect(info.startIndex).toBe(3); // page 1 * 3 items per page
      expect(info.endIndex).toBe(6);   // min((1+1)*3, 10)
      expect(info.hasNextPage).toBe(true);
      expect(info.hasPrevPage).toBe(true);
    });

    it('should handle first page', () => {
      const info = calculatePaginationInfo(10, 0, 5);
      
      expect(info.currentPage).toBe(0);
      expect(info.startIndex).toBe(0);
      expect(info.endIndex).toBe(5);
      expect(info.hasNextPage).toBe(true);
      expect(info.hasPrevPage).toBe(false);
    });

    it('should handle last page', () => {
      const info = calculatePaginationInfo(7, 2, 3);
      
      expect(info.currentPage).toBe(2);
      expect(info.startIndex).toBe(6);
      expect(info.endIndex).toBe(7);
      expect(info.hasNextPage).toBe(false);
      expect(info.hasPrevPage).toBe(true);
    });

    it('should handle single page', () => {
      const info = calculatePaginationInfo(3, 0, 10);
      
      expect(info.totalPages).toBe(1);
      expect(info.hasNextPage).toBe(false);
      expect(info.hasPrevPage).toBe(false);
    });
  });
});
