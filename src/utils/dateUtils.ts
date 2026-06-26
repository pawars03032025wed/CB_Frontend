import { useState, useEffect } from "react";

/**
 * Formats a date string or object into Indian Standard Time (IST)
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatIST(date: string | Date | number, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return "N/A";
  
  let d: Date;
  if (date && typeof date === "object" && "toDate" in date && typeof date.toDate === "function") {
    d = date.toDate();
  } else {
    d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  }
  
  // Check if date is valid
  if (isNaN(d.getTime())) return "Invalid Date";

  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    ...options
  });
}

/**
 * Returns the current date/time in IST ISO format
 */
export function getISTNow(): Date {
  // We return a Date object, but the display will be handled by formatIST
  return new Date();
}

/**
 * Hook to get the current time updated every second
 */
export function useLiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
}

/**
 * Returns the current date in YYYY-MM-DD format in IST
 */
export function getISTDateString(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };
  const parts = new Intl.DateTimeFormat("en-IN", options).formatToParts(date);
  const day = parts.find(p => p.type === "day")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const year = parts.find(p => p.type === "year")?.value;
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date for display in the UI (Date only)
 */
export function formatISTDate(date: string | Date | number): string {
  return formatIST(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

/**
 * Formats a time for display in the UI (Time only)
 */
export function formatISTTime(date: string | Date | number): string {
  return formatIST(date, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

/**
 * Formats a full date and time for display in the UI
 */
export function formatISTFull(date: string | Date | number): string {
  return formatIST(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}
