import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CustomCaption({ displayMonth, goToMonth }) {
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="flex justify-between items-center p-2">
      <Select
        value={String(displayMonth.getMonth())}
        onValueChange={(val) => {
          const newDate = new Date(displayMonth);
          newDate.setMonth(Number(val));
          goToMonth(newDate); // ✅ correct function
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={String(month)}>
              {format(new Date(0, month), "MMMM")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(displayMonth.getFullYear())}
        onValueChange={(val) => {
          const newDate = new Date(displayMonth);
          newDate.setFullYear(Number(val));
          goToMonth(newDate); // ✅ correct function
        }}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
