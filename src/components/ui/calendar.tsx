import * as React from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, selected, onSelect, ...props }, ref) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
        days.push({ date: prevMonthDay, isCurrentMonth: false });
      }

      // Add days of the current month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push({ date: new Date(year, month, day), isCurrentMonth: true });
      }

      // Add empty cells for days after the last day of the month
      const remainingCells = 42 - days.length; // 6 rows * 7 days
      for (let day = 1; day <= remainingCells; day++) {
        const nextMonthDay = new Date(year, month + 1, day);
        days.push({ date: nextMonthDay, isCurrentMonth: false });
      }

      return days;
    };

    const navigateMonth = (direction: "prev" | "next") => {
      setCurrentMonth((prev) => {
        const newMonth = new Date(prev);
        if (direction === "prev") {
          newMonth.setMonth(prev.getMonth() - 1);
        } else {
          newMonth.setMonth(prev.getMonth() + 1);
        }
        return newMonth;
      });
    };

    const handleDateClick = (date: Date) => {
      if (onSelect) {
        onSelect(date);
      }
    };

    const isSelected = (date: Date) => {
      if (!selected) return false;
      return date.toDateString() === selected.toDateString();
    };

    const isToday = (date: Date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    const days = getDaysInMonth(currentMonth);

    return (
      <div
        ref={ref}
        className={`p-4 bg-brand-surface/60 rounded-xl border border-brand-border/50 ${
          className || ""
        }`}
        {...props}
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth("prev")}
            className="h-6 w-6 p-0 bg-transparent hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors flex items-center justify-center"
          >
            <IconChevronLeft className="w-3 h-3" />
          </button>

          <div className="text-white text-base font-medium">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>

          <button
            onClick={() => navigateMonth("next")}
            className="h-6 w-6 p-0 bg-transparent hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors flex items-center justify-center"
          >
            <IconChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-text-muted text-xs text-center py-1 font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((dayObj, index) => {
              const { date, isCurrentMonth } = dayObj;
              const day = date.getDate();

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    h-8 w-[80%] cursor-pointer rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center
                    ${
                      !isCurrentMonth
                        ? "text-text-muted/50 hover:text-text-muted hover:bg-brand-surface/30"
                        : "text-white hover:bg-brand-surface/80"
                    }
                    ${
                      isSelected(date)
                        ? "bg-brand-primary text-white shadow-lg "
                        : ""
                    }
                    ${
                      isToday(date) && !isSelected(date)
                        ? "bg-brand-surface text-white ring-1 ring-brand-primary/50"
                        : ""
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

Calendar.displayName = "Calendar";

export { Calendar };
