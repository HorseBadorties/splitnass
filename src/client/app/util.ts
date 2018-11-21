import * as _ from "lodash";

export function formatDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd  = date.getDate();
  return _.padStart(dd.toString(), 2, "0") + "." + _.padStart(mm.toString(), 2, "0") + "." + yyyy.toString();
}