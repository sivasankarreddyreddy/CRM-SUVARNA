import { useState, useCallback, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { FilterParams, SortParams } from '@shared/filter-types';

interface UseDataFiltersOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  defaultSort?: SortParams;
  persistKey?: string; // For persisting filter state in localStorage
}

export function useDataFilters(options?: UseDataFiltersOptions) {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    defaultSort,
    persistKey
  } = options || {};

  // Try to load persisted state if a persistKey is provided
  const getInitialState = (): FilterParams => {
    if (persistKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`filters_${persistKey}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load persisted filters:', e);
        }
      }
    }

    return {
      page: defaultPage,
      pageSize: defaultPageSize,
      ...(defaultSort && { column: defaultSort.column, direction: defaultSort.direction }),
    };
  };

  const [filters, setFilters] = useState<FilterParams>(getInitialState);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.fromDate && filters.toDate
      ? { from: new Date(filters.fromDate), to: new Date(filters.toDate) }
      : undefined
  );

  // Save to localStorage whenever filters change
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      localStorage.setItem(`filters_${persistKey}`, JSON.stringify(filters));
    }
  }, [filters, persistKey]);

  // Update page
  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  // Update page size and reset to page 1
  const setPageSize = useCallback((pageSize: number) => {
    setFilters(prev => ({ ...prev, page: 1, pageSize }));
  }, []);

  // Update sort order
  const setSort = useCallback((sort: SortParams) => {
    setFilters(prev => ({
      ...prev,
      column: sort.column,
      direction: sort.direction
    }));
  }, []);

  // Update date range and convert to ISO strings for API
  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    
    if (range?.from) {
      // Set the fromDate to the start of the day
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      
      // Set the toDate to the end of the day if it exists
      const to = range.to ? new Date(range.to) : new Date(range.from);
      to.setHours(23, 59, 59, 999);
      
      setFilters(prev => ({
        ...prev,
        page: 1, // Reset to first page when date filter changes
        fromDate: from.toISOString(),
        toDate: to.toISOString()
      }));
    } else {
      // Clear date range filters
      setFilters(prev => {
        const { fromDate, toDate, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    }
  }, []);

  // Update search term
  const setSearchTerm = useCallback((search: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1, // Reset to first page when search changes
      search: search || undefined // Don't send empty strings
    }));
  }, []);

  // Set a custom filter
  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      page: 1, // Reset to first page when filters change
      [key]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setDateRange(undefined);
    setFilters({
      page: defaultPage,
      pageSize: defaultPageSize,
      ...(defaultSort && { column: defaultSort.column, direction: defaultSort.direction }),
    });
  }, [defaultPage, defaultPageSize, defaultSort]);

  return {
    filters,
    dateRange,
    setPage,
    setPageSize,
    setSort,
    setDateRange: handleDateRangeChange,
    setSearchTerm,
    setFilter,
    clearFilters
  };
}