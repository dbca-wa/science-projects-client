import { useEffect, useState } from "react";

export const useFormattedDate = (
  date: string | Date | undefined | null,
): string => {
  const [formattedDate, setFormattedDate] = useState<string>("");

  const getOrdinalIndicator = (day: number) => {
    if (day > 10 && day < 20) {
      return "th";
    } else {
      const lastDigit = day % 10;
      switch (lastDigit) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }
  };

  useEffect(() => {
    if (date === null || date === undefined) {
      setFormattedDate("");
      return;
    }

    let inputDate: Date;

    if (date instanceof Date) {
      inputDate = date;
    } else if (typeof date === "string") {
      inputDate = new Date(date);

      if (isNaN(inputDate.getTime())) {
        setFormattedDate("");
        return;
      }
    } else {
      setFormattedDate("");
      return;
    }

    const dateOptions = {
      year: "numeric" as const,
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: "Australia/Perth",
    };

    const day = inputDate.getDate();
    const ordinalIndicator = getOrdinalIndicator(day);
    // eslint-disable-next-line
    //@ts-ignore
    let formattedDate = inputDate.toLocaleString("en-AU", dateOptions);
    formattedDate = formattedDate.replace(
      new RegExp(`\\b${day}\\b`),
      `${day}${ordinalIndicator}`,
    );
    formattedDate = formattedDate.replace(
      /\b(\d{1,2}:\d{1,2})\s*([ap]m)\b/gi,
      (match, time, meridiem) => {
        const [hour, minute] = time.split(":");
        const hourInt = parseInt(hour);
        const suffix = meridiem.toUpperCase();
        const formattedHour =
          hourInt === 0 || hourInt === 12 ? 12 : hourInt % 12;
        return `${formattedHour}:${minute}${suffix}`;
      },
    );
    formattedDate = formattedDate.replace("at", "@");

    const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
      inputDate,
    );
    const monthIndex = formattedDate.indexOf(month);
    formattedDate =
      formattedDate.slice(0, monthIndex + month.length) +
      "," +
      formattedDate.slice(monthIndex + month.length);
    setFormattedDate(formattedDate);
  }, [date]);

  return formattedDate;
};
