import { padStart } from "lodash-es";

export function formatDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd  = date.getDate();
  return padStart(dd.toString(), 2, "0") + "." + padStart(mm.toString(), 2, "0") + "." + yyyy.toString();
}