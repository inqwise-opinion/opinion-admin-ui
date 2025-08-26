/**
 * Custom hook for managing user table state and operations
 */

import { useState, useMemo } from 'react';
import { User } from '../types';
import { 
  sortUsers, 
  filterUsers, 
  paginate, 
  toggleSortDirection,
  UserSortField, 
  SortDirection 
} from '../utils/tableUtils';

interface UseUserTableProps {
  users: User[];
  initialRowsPerPage?: number;
}

export function useUserTable({ users, initialRowsPerPage = 25 }: UseUserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [sortField, setSortField] = useState<UserSortField>('userId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Apply filtering, sorting, and pagination
  const processedUsers = useMemo(() => {
    // Step 1: Filter
    const filtered = filterUsers(users, searchTerm);
    
    // Step 2: Sort
    const sorted = sortUsers(filtered, sortField, sortDirection);
    
    return {
      filtered,
      sorted,
      paginated: paginate(sorted, page, rowsPerPage),
    };
  }, [users, searchTerm, sortField, sortDirection, page, rowsPerPage]);

  const handleSort = (field: UserSortField) => {
    const newDirection = toggleSortDirection(sortField, sortDirection, field);
    setSortDirection(newDirection);
    setSortField(field);
    setPage(0); // Reset to first page when sorting
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPage(0); // Reset to first page when searching
  };

  return {
    // Data
    filteredUsers: processedUsers.filtered,
    sortedUsers: processedUsers.sorted,
    paginatedUsers: processedUsers.paginated,
    
    // State
    searchTerm,
    page,
    rowsPerPage,
    sortField,
    sortDirection,
    
    // Handlers
    handleSort,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange: setSearchTerm,
    
    // Computed values
    totalCount: processedUsers.filtered.length,
    hasResults: processedUsers.filtered.length > 0,
    isSearching: searchTerm.trim() !== '',
  };
}
