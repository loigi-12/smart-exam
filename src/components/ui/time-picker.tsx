import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TimePickerProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  maxTime?: Date;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  maxTime,
}: TimePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal w-full",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? format(value, "hh:mm a") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-3">
          <input
            type="time"
            value={value ? format(value, "HH:mm") : ""}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(":");
              const newTime = new Date(0, 0, 0, +hours, +minutes);
              onChange(newTime);
            }}
            step="1"
            max={maxTime ? format(maxTime, "HH:mm") : undefined}
            className="w-auto p-0"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
