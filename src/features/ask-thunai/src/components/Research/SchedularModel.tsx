import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";

type FrequencyType = "DAILY" | "WEEKLY" | "MONTHLY" | "";

interface SchedulerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: {
    frequency: FrequencyType;
    selectedDates?: Date[];
    time: string;
  }) => void;
  initialValues?: {
    frequency?: string;
    time?: string;
    days?: string[];
    dates?: number[];
  };
}

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const SchedulerModal = ({ open, onClose, onConfirm, initialValues }: SchedulerModalProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [frequency, setFrequency] = useState<FrequencyType>("");
  const [runTime, setRunTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const timePickerRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open && initialValues) {
      console.log("SchedulerModal received initialValues:", initialValues);
      
      // Map schedule type to frequency
      const frequencyMap: { [key: string]: FrequencyType } = {
        "daily": "DAILY",
        "weekly": "WEEKLY",
        "monthly": "MONTHLY",
        "onely": "DAILY"
      };
      
      const mappedFrequency = initialValues.frequency 
        ? frequencyMap[initialValues.frequency.toLowerCase()] || ""
        : "";
      
      console.log("Setting frequency to:", mappedFrequency);
      setFrequency(mappedFrequency);
      if (initialValues.time) {
        const [h, m] = initialValues.time.split(":");
        setHours(h.padStart(2, "0"));   // ✅ Directly set hours
        setMinutes(m.padStart(2, "0")); // ✅ Directly set minutes
        // runTime will auto-update via the hours/minutes useEffect
      }
      // if (initialValues.time) {
      //   console.log("Setting time to:", initialValues.time);
      //   setRunTime(initialValues.time);
      // }
    } else if (!open) {
      setFrequency("");
      setRunTime("");
      setSelectedDates([]);
    }
  }, [initialValues, open]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  // Get the starting day of the month (0 = Sunday, 6 = Saturday)
  const startingDayIndex = getDay(monthStart);

  // Auto-select dates based on frequency
  const autoSelectDates = (newFrequency: FrequencyType) => {
    const today = startOfDay(new Date());
    
    if (newFrequency === "DAILY") {
      // Pre-select all dates from today onwards in the current month
      const futureDates = daysInMonth.filter(date => 
        isSameDay(date, today) || isAfter(date, today)
      );
      setSelectedDates(futureDates);
    } else if (newFrequency === "WEEKLY") {
      // Pre-select all dates with the same day of week as today
      const todayDayOfWeek = getDay(today);
      const sameDayDates = daysInMonth.filter(date => 
        getDay(date) === todayDayOfWeek && 
        (isSameDay(date, today) || isAfter(date, today))
      );
      setSelectedDates(sameDayDates);
    } else if (newFrequency === "MONTHLY") {
      // Pre-select all dates with the same date number as today
      const todayDateNumber = today.getDate();
      const sameDateDates = daysInMonth.filter(date => 
        date.getDate() === todayDateNumber && 
        (isSameDay(date, today) || isAfter(date, today))
      );
      setSelectedDates(sameDateDates);
    }
  };

  // Populate initial dates from initialValues
  useEffect(() => {
    if (open && initialValues) {
      const today = startOfDay(new Date());
      const dates: Date[] = [];
      
      if (initialValues.days && initialValues.days.length > 0) {
        // For weekly - convert day names to dates
        const dayMap: { [key: string]: number } = {
          "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
          "Thursday": 4, "Friday": 5, "Saturday": 6
        };
        
        initialValues.days.forEach(dayName => {
          const dayOfWeek = dayMap[dayName];
          const sameDayDates = daysInMonth.filter(d => 
            getDay(d) === dayOfWeek && (isSameDay(d, today) || isAfter(d, today))
          );
          dates.push(...sameDayDates);
        });
      } else if (initialValues.dates && initialValues.dates.length > 0) {
        // For monthly - convert date numbers to dates
        initialValues.dates.forEach(dateNum => {
          const sameDateDates = daysInMonth.filter(d => 
            d.getDate() === dateNum && (isSameDay(d, today) || isAfter(d, today))
          );
          dates.push(...sameDateDates);
        });
      }
      
      if (dates.length > 0) {
        setSelectedDates(dates);
      } else {
        // If no initial dates or they're in the past, auto-select based on frequency
        autoSelectDates(frequency);
      }
    } else if (open) {
      // Auto-select dates when frequency changes and no initial values
      autoSelectDates(frequency);
    }
  }, [open, frequency, currentMonth]);

  const toggleDate = (date: Date) => {
    const today = startOfDay(new Date());
    
    setSelectedDates((prev) => {
      const existingIndex = prev.findIndex((d) => isSameDay(d, date));

      if (frequency === "DAILY") {
        // DAILY: Toggle individual dates, but maintain the "from today onwards" concept
        if (existingIndex >= 0) {
          return prev.filter((d) => !isSameDay(d, date));
        } else {
          return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
        }
      } else if (frequency === "WEEKLY") {
        // WEEKLY: Toggle dates with the same day of week
        const clickedDayOfWeek = getDay(date);
        
        if (existingIndex >= 0) {
          // If this day of week is selected, remove all dates with this day of week
          return prev.filter((d) => getDay(d) !== clickedDayOfWeek);
        } else {
          // Add all future dates with this day of week
          const sameDayDates = daysInMonth.filter(d => 
            getDay(d) === clickedDayOfWeek && 
            (isSameDay(d, today) || isAfter(d, today))
          );
          
          // Combine with existing selections and remove duplicates
          const combined = [...prev, ...sameDayDates];
          return combined.filter((date, index, self) => 
            index === self.findIndex(d => isSameDay(d, date))
          );
        }
      } else if (frequency === "MONTHLY") {
        // MONTHLY: Toggle dates with the same date number
        const clickedDateNumber = date.getDate();
        
        if (existingIndex >= 0) {
          // If this date number is selected, remove all dates with this date number
          return prev.filter((d) => d.getDate() !== clickedDateNumber);
        } else {
          // Add all future dates with this date number
          const sameDateDates = daysInMonth.filter(d => 
            d.getDate() === clickedDateNumber && 
            (isSameDay(d, today) || isAfter(d, today))
          );
          
          // Combine with existing selections and remove duplicates
          const combined = [...prev, ...sameDateDates];
          return combined.filter((date, index, self) => 
            index === self.findIndex(d => isSameDay(d, date))
          );
        }
      }

      return prev;
    });
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some((d) => isSameDay(d, date));
  };

  // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "ST";
    if (j === 2 && k !== 12) return "ND";
    if (j === 3 && k !== 13) return "RD";
    return "TH";
  };

  // Generate summary message
  const summaryMessage = useMemo(() => {
    if (selectedDates.length === 0 || !runTime) return "";

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());

    if (frequency === "DAILY") {
      return `RUNS DAILY STARTING ${format(sortedDates[0], "dd/MM/yyyy")} AT ${runTime}.`;
    } else if (frequency === "WEEKLY") {
      // Get unique days of week from selected dates
      const daysOfWeek = [...new Set(sortedDates.map(d => getDay(d)))].sort();
      const dayNames = daysOfWeek.map(day => WEEKDAY_NAMES[day].slice(0, 3).toUpperCase());
      
      if (dayNames.length === 0) return "";
      if (dayNames.length === 1) {
        return `RUNS WEEKLY ON ${dayNames[0]} AT ${runTime}.`;
      }
      
      const lastDay = dayNames.pop();
      return `RUNS WEEKLY ON ${dayNames.join(", ")} AND ${lastDay} AT ${runTime}.`;
    } else if (frequency === "MONTHLY") {
      // Get unique dates of month from selected dates
      const datesOfMonth = [...new Set(sortedDates.map(d => d.getDate()))].sort((a, b) => a - b);
      
      if (datesOfMonth.length === 0) return "";
      if (datesOfMonth.length === 1) {
        const suffix = getOrdinalSuffix(datesOfMonth[0]);
        return `RUNS MONTHLY ON THE ${datesOfMonth[0]}${suffix} AT ${runTime}.`;
      }
      
      const lastDate = datesOfMonth.pop()!;
      const dateList = datesOfMonth.map(d => `${d}${getOrdinalSuffix(d)}`).join(", ");
      return `RUNS MONTHLY ON THE ${dateList} AND ${lastDate}${getOrdinalSuffix(lastDate)} AT ${runTime}.`;
    }

    return "";
  }, [selectedDates, runTime, frequency]);

  // Get instruction text based on frequency
  const instructionText = useMemo(() => {
    switch (frequency) {
      case "DAILY":
        return "* All dates from today are pre-selected. Click to toggle.";
      case "WEEKLY":
        return "* Click a date to toggle its Day of Week";
      case "MONTHLY":
        return "* Click a date to toggle its Day of Month";
      default:
        return "";
    }
  }, [frequency]);

  const handleConfirm = () => {
    if (selectedDates.length === 0 || !runTime) return;

    onConfirm({
      frequency,
      selectedDates,
      time: runTime,
    });
    // handleClose();
  };

  const handleFrequencyChange = (newFrequency: FrequencyType) => {
    setFrequency(newFrequency);
    // Auto-selection will happen via useEffect
  };

  const handleClose = () => {
    // Reset state when closing
    setSelectedDates([]);
    setFrequency("");
    setRunTime("");
    setCurrentMonth(new Date());
    onClose();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timePickerRef.current && !timePickerRef.current.contains(e.target as Node)) {
        setShowTimePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync hours+minutes → runTime
  useEffect(() => {
    if (hours && minutes) {
      setRunTime(`${hours}:${minutes}`);
    } else {
      setRunTime("");
    }
  }, [hours, minutes]);

  // Auto-scroll to selected hour/minute when dropdown opens
  useEffect(() => {
    if (showTimePicker) {
      setTimeout(() => {
        if (hoursRef.current && hours) {
          const selectedBtn = hoursRef.current.querySelector(`[data-value="${hours}"]`) as HTMLElement;
          if (selectedBtn) selectedBtn.scrollIntoView({ block: "center" });
        }
        if (minutesRef.current && minutes) {
          const selectedBtn = minutesRef.current.querySelector(`[data-value="${minutes}"]`) as HTMLElement;
          if (selectedBtn) selectedBtn.scrollIntoView({ block: "center" });
        }
      }, 0);
    }
  }, [showTimePicker]);
  // Re-calculate selections when month changes
  useEffect(() => {
    if (frequency === "DAILY") {
      const today = startOfDay(new Date());
      const futureDates = daysInMonth.filter(date => 
        isSameDay(date, today) || isAfter(date, today)
      );
      setSelectedDates(futureDates);
    } else if (frequency === "WEEKLY") {
      const today = startOfDay(new Date());
      // Get all selected days of week from current selections
      const selectedDaysOfWeek = [...new Set(selectedDates.map(d => getDay(d)))];
      
      if (selectedDaysOfWeek.length > 0) {
        const newSelections = daysInMonth.filter(date => 
          selectedDaysOfWeek.includes(getDay(date)) && 
          (isSameDay(date, today) || isAfter(date, today))
        );
        setSelectedDates(newSelections);
      }
    } else if (frequency === "MONTHLY") {
      const today = startOfDay(new Date());
      // Get all selected date numbers from current selections
      const selectedDateNumbers = [...new Set(selectedDates.map(d => d.getDate()))];
      
      if (selectedDateNumbers.length > 0) {
        const newSelections = daysInMonth.filter(date => 
          selectedDateNumbers.includes(date.getDate()) && 
          (isSameDay(date, today) || isAfter(date, today))
        );
        setSelectedDates(newSelections);
      }
    }
  }, [currentMonth]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[600px] p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-bold uppercase tracking-wide">
                Schedular
              </CardTitle>
            </div>
           
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-[1.2fr_1fr] gap-6">
              {/* Left side - Calendar */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  Select Schedule Patterns
                </h3>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-1">
                  {/* Week day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-400 h-8 flex items-center justify-center"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar dates */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startingDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-9" />
                    ))}

                    {/* Actual dates */}
                    {daysInMonth.map((date) => {
                      const isSelected = isDateSelected(date);
                      const isToday = isSameDay(date, new Date());
                      const today = startOfDay(new Date());
                      const isPast = isBefore(date, today);

                      return (
                        <Button
                          key={date.toISOString()}
                          variant="ghost"
                          disabled={isPast}
                          className={cn(
                            "h-9 w-full p-0 font-normal text-sm rounded-lg transition-all text-gray-700",
                            isSelected && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                            !isSelected && isToday && "border-2 border-blue-400 text-blue-600",
                            !isSelected && !isToday && !isPast && "hover:bg-gray-100 hover:text-gray-900",
                            isPast && "text-gray-300 cursor-not-allowed opacity-40"
                          )}
                          onClick={() => !isPast && toggleDate(date)}
                        >
                          {format(date, "d")}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-gray-400 italic mt-2">
                  {instructionText}
                </p>
              </div>

              {/* Right side - Frequency & Time */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  Frequency
                </h3>

                <div className="space-y-2">
                  {(["DAILY", "WEEKLY", "MONTHLY"] as FrequencyType[]).map((freq) => (
                    <Button
                      key={freq}
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-center text-sm font-medium h-10 transition-all",
                        frequency === freq
                          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-gray-200"
                      )}
                      onClick={() => handleFrequencyChange(freq)}
                    >
                      {freq}
                    </Button>
                  ))}
                </div>

                <div className="space-y-3 mt-6">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Run Time
                  </h3>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    {/* <Input
                      type="time"
                      value={runTime}
                      onChange={(e) => setRunTime(e.target.value)}
                      className="pl-10 h-10"
                    /> */}
                    {/* <Input
                    type="time"
                    lang="en-GB"
                    value={runTime}
                    onChange={(e) => setRunTime(e.target.value)}
                    className="pl-10 h-10"
                  /> */}
                
                    <div className="relative" ref={timePickerRef}>
                      {/* Trigger */}
                      <button
                        type="button"
                        onClick={() => setShowTimePicker((p) => !p)}
                        className="flex items-center gap-2 border rounded-md h-10 px-3 w-full text-sm text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className={runTime ? "text-gray-900" : "text-gray-400"}>
                          {runTime || "HH : MM"}
                        </span>
                      </button>

                      {/* Dropdown */}
                    {showTimePicker && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <div className="flex">
                          {/* Hours column */}
                          <div
                            ref={hoursRef}
                            className="flex-1 h-48 overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                          >
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                              <button
                                key={h}
                                data-value={h}
                                type="button"
                                onClick={() => setHours(h)}
                                className={cn(
                                  "w-full text-center py-1.5 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors",
                                  hours === h && "bg-blue-600 text-white hover:bg-blue-600 hover:text-white"
                                )}
                              >
                                {h}
                              </button>
                            ))}
                          </div>

                          {/* Minutes column */}
                          <div
                            ref={minutesRef}
                            className="flex-1 h-48 overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                          >
                            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                              <button
                                key={m}
                                data-value={m}
                                type="button"
                                onClick={() => {
                                  setMinutes(m);
                                  setShowTimePicker(false);
                                }}
                                className={cn(
                                  "w-full text-center py-1.5 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors",
                                  minutes === m && "bg-blue-600 text-white hover:bg-blue-600 hover:text-white"
                                )}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Banner */}
            {summaryMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 font-medium">
                    {summaryMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Confirm Button */}
            <Button
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white h-12 text-sm font-bold uppercase tracking-wide"
              onClick={handleConfirm}
              disabled={selectedDates.length === 0 || !runTime}
            >
              Confirm Schedule Settings
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};