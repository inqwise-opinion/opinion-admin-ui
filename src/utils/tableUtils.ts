/**
 * Utility functions for table operations like sorting, filtering, and pagination
 */

import { User } from '../types';

export type SortDirection = 'asc' | 'desc';
export type UserSortField = 'userId' | 'userName' | 'isActive' | 'insertDate';

/**
 * Sort users by specified field and direction
 */
export function sortUsers(users: User[], sortField: UserSortField, sortDirection: SortDirection): User[] {
  return [...users].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'userId':
        aValue = a.userId;
        bValue = b.userId;
        break;
      case 'userName':
        aValue = a.userName.toLowerCase();
        bValue = b.userName.toLowerCase();
        break;
      case 'isActive':
        aValue = a.isActive ? 1 : 0;
        bValue = b.isActive ? 1 : 0;
        break;
      case 'insertDate':
        aValue = new Date(a.insertDate).getTime();
        bValue = new Date(b.insertDate).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Filter users by search term (searches username and email)
 */
export function filterUsers(users: User[], searchTerm: string): User[] {
  if (!searchTerm.trim()) {
    return users;
  }

  const searchLower = searchTerm.toLowerCase();
  return users.filter(user =>
    user.userName.toLowerCase().includes(searchLower) ||
    user.email?.toLowerCase().includes(searchLower)
  );
}

/**
 * Paginate an array of items
 */
export function paginate<T>(items: T[], page: number, rowsPerPage: number): T[] {
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  return items.slice(startIndex, endIndex);
}

/**
 * Toggle sort direction for a field
 */
export function toggleSortDirection(
  currentField: UserSortField,
  currentDirection: SortDirection,
  newField: UserSortField
): SortDirection {
  if (currentField === newField) {
    return currentDirection === 'asc' ? 'desc' : 'asc';
  }
  return 'asc';
}

/**
 * Calculate pagination info
 */
export function calculatePaginationInfo(totalItems: number, page: number, rowsPerPage: number) {
  return {
    totalItems,
    totalPages: Math.ceil(totalItems / rowsPerPage),
    currentPage: page,
    startIndex: page * rowsPerPage,
    endIndex: Math.min((page + 1) * rowsPerPage, totalItems),
    hasNextPage: (page + 1) * rowsPerPage < totalItems,
    hasPrevPage: page > 0,
  };
}
