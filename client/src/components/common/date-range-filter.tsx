import { useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange | undefined) => void;
  dateRange: DateRange | undefined;
}

export function DateRangeFilter({ onDateRangeChange, dateRange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const handleClearFilter = () => {
    onDateRangeChange(undefined);
  };

  const handlePresetClick = (days: number) => {
    const today = new Date();
    const from = addDays(today, -days);
    const range = { from, to: today };
    onDateRangeChange(range);
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                  {format(dateRange.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(dateRange.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Filter by date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePresetClick(7)}
              >
                Last 7 days
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePresetClick(30)}
              >
                Last 30 days
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePresetClick(90)}
              >
                Last 90 days
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleClearFilter}
              >
                Clear filter
              </Button>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}