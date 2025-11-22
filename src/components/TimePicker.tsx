import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

export const TimePicker = ({ value, onChange, className }: TimePickerProps) => {
  const [hours, setHours] = useState("09");
  const [minutes, setMinutes] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  // Parse existing value
  useEffect(() => {
    if (value) {
      const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        setHours(match[1].padStart(2, "0"));
        setMinutes(match[2]);
        setPeriod(match[3].toUpperCase() as "AM" | "PM");
      }
    }
  }, [value]);

  const handleTimeChange = (newHours: string, newMinutes: string, newPeriod: "AM" | "PM") => {
    const formattedHours = parseInt(newHours) % 12 || 12;
    const timeString = `${formattedHours.toString().padStart(2, "0")}:${newMinutes} ${newPeriod}`;
    onChange(timeString);
  };

  const quickTimes = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal glass-card",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 glass-premium" align="start">
        <div className="p-4 space-y-4">
          {/* Manual Time Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Set Time</label>
            <div className="flex items-center gap-2">
              <select
                value={hours}
                onChange={(e) => {
                  setHours(e.target.value);
                  handleTimeChange(e.target.value, minutes, period);
                }}
                className="glass-card px-3 py-2 rounded-lg bg-background"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = (i + 1).toString().padStart(2, "0");
                  return (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  );
                })}
              </select>
              <span className="text-xl">:</span>
              <select
                value={minutes}
                onChange={(e) => {
                  setMinutes(e.target.value);
                  handleTimeChange(hours, e.target.value, period);
                }}
                className="glass-card px-3 py-2 rounded-lg bg-background"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const minute = (i * 5).toString().padStart(2, "0");
                  return (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  );
                })}
              </select>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setPeriod("AM");
                    handleTimeChange(hours, minutes, "AM");
                  }}
                  className={cn(
                    "px-3 py-2 rounded-lg transition",
                    period === "AM"
                      ? "bg-primary text-primary-foreground"
                      : "glass-card hover:bg-primary/10"
                  )}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPeriod("PM");
                    handleTimeChange(hours, minutes, "PM");
                  }}
                  className={cn(
                    "px-3 py-2 rounded-lg transition",
                    period === "PM"
                      ? "bg-primary text-primary-foreground"
                      : "glass-card hover:bg-primary/10"
                  )}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Quick Select Times */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Select</label>
            <div className="grid grid-cols-2 gap-2">
              {quickTimes.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => onChange(time)}
                  className={cn(
                    "glass-card px-3 py-2 rounded-lg text-sm transition hover:bg-primary/10",
                    value === time && "bg-primary/20 border-primary"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
