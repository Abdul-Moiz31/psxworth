import { coerceToDatePreservingLocalDate } from "@/types/localDate";

export function toDateOnlyDate(date: Date | string | number): Date {
  const d = coerceToDatePreservingLocalDate(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function toDateOnlyTimestamp(date: Date | string | number): number {
  return toDateOnlyDate(date).getTime();
}
