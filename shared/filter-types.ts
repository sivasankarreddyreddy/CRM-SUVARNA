export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  column: string;
  direction: 'asc' | 'desc';
}

export interface DateRangeParams {
  fromDate?: string; // ISO string
  toDate?: string;   // ISO string
}

export interface FilterParams extends PaginationParams, Partial<SortParams>, Partial<DateRangeParams> {
  search?: string;
  [key: string]: any; // Additional filters
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}