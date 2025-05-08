import { SQL, sql } from 'drizzle-orm';
import { PaginationParams, FilterParams, PaginatedResponse } from '@shared/filter-types';
import { pool } from './db';

/**
 * Helper function to apply pagination to SQL queries
 */
export function applyPagination<T extends object>(
  baseQuery: SQL,
  params: PaginationParams,
  countQuery: SQL
): Promise<PaginatedResponse<T>> {
  // Default values
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(100, params.pageSize || 10));
  
  // Calculate offset
  const offset = (page - 1) * pageSize;
  
  // Apply pagination to the query
  const paginatedQuery = sql`${baseQuery} LIMIT ${pageSize} OFFSET ${offset}`;
  
  return Promise.all([
    // Get the total count
    pool.query(countQuery).then(result => parseInt(result.rows[0].count) || 0),
    
    // Get the paginated data
    pool.query(paginatedQuery).then(result => result.rows as T[])
  ]).then(([totalCount, data]) => {
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return {
      data,
      totalCount,
      page,
      pageSize,
      totalPages
    };
  });
}

/**
 * Helper function to build ORDER BY clause from sort parameters
 */
export function buildSortClause(
  params: Partial<FilterParams>,
  defaultColumn: string = 'created_at',
  defaultDirection: 'asc' | 'desc' = 'desc',
  columnMappings: Record<string, string> = {}
): SQL {
  // Get the column and direction from params or use defaults
  const column = params.column || defaultColumn;
  const direction = params.direction || defaultDirection;
  
  // Map frontend column names to database column names if needed
  const dbColumn = columnMappings[column] || column;
  
  // Return the ORDER BY clause
  return sql`ORDER BY ${sql.raw(dbColumn)} ${sql.raw(direction)}`;
}

/**
 * Helper function to build WHERE clause for date range filtering
 */
export function buildDateRangeClause(
  params: Partial<FilterParams>,
  dateColumn: string = 'created_at'
): SQL | undefined {
  if (!params.fromDate && !params.toDate) {
    return undefined;
  }
  
  if (params.fromDate && params.toDate) {
    return sql`${sql.raw(dateColumn)} BETWEEN ${params.fromDate}::timestamp AND ${params.toDate}::timestamp`;
  }
  
  if (params.fromDate) {
    return sql`${sql.raw(dateColumn)} >= ${params.fromDate}::timestamp`;
  }
  
  if (params.toDate) {
    return sql`${sql.raw(dateColumn)} <= ${params.toDate}::timestamp`;
  }
  
  return undefined;
}

/**
 * Helper function to build a search clause
 */
export function buildSearchClause(
  params: Partial<FilterParams>,
  searchColumns: string[]
): SQL | undefined {
  if (!params.search || !searchColumns.length) {
    return undefined;
  }
  
  const searchTerm = `%${params.search}%`;
  const searchConditions = searchColumns.map(column => 
    sql`CAST(${sql.raw(column)} AS TEXT) ILIKE ${searchTerm}`
  );
  
  // Combine all search conditions with OR
  return sql.join(searchConditions, sql` OR `);
}

/**
 * Combine multiple WHERE conditions with AND
 */
export function combineWhereConditions(...conditions: (SQL | undefined)[]): SQL | undefined {
  const validConditions = conditions.filter(Boolean) as SQL[];
  
  if (validConditions.length === 0) {
    return undefined;
  }
  
  if (validConditions.length === 1) {
    return validConditions[0];
  }
  
  return sql.join(validConditions, sql` AND `);
}

/**
 * Get the SQL representation for a where clause (either WHERE or AND)
 */
export function getWhereClause(condition: SQL | undefined, isFirst: boolean = true): SQL {
  if (!condition) {
    return sql``;
  }
  
  return isFirst ? sql`WHERE ${condition}` : sql`AND ${condition}`;
}