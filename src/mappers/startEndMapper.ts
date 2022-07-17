import { addDays, addHours } from "date-fns";

export const StartEndMapper = (start: string, end: string) => {
  return [
    addHours(new Date(start), 4).toDateString(),
    addDays(addHours(new Date(end), 4), 1).toDateString(),
  ];
};
