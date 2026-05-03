import { z } from "zod";

export type LocalDate = string & { readonly __brand: "LocalDate" };

const LOCAL_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatAsLocalDate(date: Date): LocalDate {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}` as LocalDate;
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  const candidate = new Date(year, month - 1, day);
  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
  );
}

export function isLocalDate(value: string): value is LocalDate {
  if (!LOCAL_DATE_REGEX.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  return isValidDateParts(year, month, day);
}

export function toLocalDate(value: Date | string | number): LocalDate {
  if (typeof value === "string" && isLocalDate(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${String(value)}`);
  }

  return formatAsLocalDate(date);
}

export function localDateToDate(value: LocalDate): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function coerceToDatePreservingLocalDate(value: Date | string | number): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" && isLocalDate(value)) {
    return localDateToDate(value);
  }

  return new Date(value);
}

export function coerceToLocalDateDate(value: Date | string | number): Date {
  return localDateToDate(toLocalDate(value));
}

export const localDateSchema = z.custom<LocalDate>(
  (value) => typeof value === "string" && isLocalDate(value),
  "Date must be in YYYY-MM-DD format"
);

export const coerceLocalDateSchema = z
  .union([z.string(), z.date(), z.number()])
  .transform((value) => toLocalDate(value));
