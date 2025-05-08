import { useState } from "react";
import { Search, RefreshCw, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "./date-range-filter";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface DataFilterBarProps {
  onSearchChange: (value: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onRefresh: () => void;
  onClearFilters: () => void;
  searchValue: string;
  dateRange: DateRange | undefined;
  isLoading?: boolean;
  entityName?: string; // e.g., "Leads", "Products", etc.
  customFilters?: React.ReactNode;
}

export function DataFilterBar({
  onSearchChange,
  onDateRangeChange,
  onRefresh,
  onClearFilters,
  searchValue,
  dateRange,
  isLoading = false,
  entityName = "Items",
  customFilters
}: DataFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  
  // Determine if any filters are active
  const hasActiveFilters = !!searchValue || !!dateRange;
  
  return (
    <div className="bg-card rounded-md border p-4 mb-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${entityName.toLowerCase()}...`}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary-foreground text-primary w-5 h-5 text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>
      
      {showFilters && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
          />
          
          {customFilters}
        </div>
      )}
    </div>
  );
}