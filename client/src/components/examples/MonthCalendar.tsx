import { useState } from "react";
import { MonthCalendar } from "../MonthCalendar";

export default function MonthCalendarExample() {
  const [month, setMonth] = useState(new Date());

  return (
    <MonthCalendar
      selectedMonth={month}
      onMonthChange={(m) => {
        setMonth(m);
        console.log("Month changed:", m);
      }}
    />
  );
}
