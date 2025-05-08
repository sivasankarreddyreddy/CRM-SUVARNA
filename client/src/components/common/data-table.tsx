import { ReactNode, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  sortable?: boolean;
  sortKey?: string;
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sortable?: boolean;
  onSortChange?: (sort: SortState) => void;
  currentSort?: SortState;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  pagination,
  sortable = false,
  currentSort,
  onSortChange
}: DataTableProps<T>) {
  
  const handleSortChange = (column: string) => {
    if (!sortable || !onSortChange) return;
    
    if (currentSort?.column === column) {
      // Switch direction if same column
      onSortChange({
        column,
        direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // New column sort, default to ascending
      onSortChange({ column, direction: 'asc' });
    }
  };

  // Get sort icon based on current sort state
  const getSortIcon = (column: string) => {
    if (!currentSort || currentSort.column !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    return currentSort.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };
  
  // Pagination variables
  const totalPages = pagination 
    ? Math.ceil(pagination.totalCount / pagination.pageSize) 
    : 1;

  // Pagination controls
  const renderPagination = () => {
    if (!pagination) return null;
    
    return (
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => pagination.onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] mx-2">
                <SelectValue placeholder={pagination.pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            of {pagination.totalCount} items
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => pagination.onPageChange(1)}
            disabled={pagination.currentPage <= 1 || isLoading}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium">
            Page {pagination.currentPage} of {totalPages || 1}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => pagination.onPageChange(totalPages)}
            disabled={pagination.currentPage >= totalPages || isLoading}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className={column.sortable ? "cursor-pointer select-none" : ""}>
                  <div 
                    className="flex items-center"
                    onClick={() => column.sortable && handleSortChange(column.sortKey || column.id)}
                  >
                    {column.header}
                    {column.sortable && getSortIcon(column.sortKey || column.id)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={`${index}-${column.id}`}>
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {renderPagination()}
    </div>
  );
}