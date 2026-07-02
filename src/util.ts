export function getDateCode(date: Date) {
  return parseInt(
    ("" + date.getFullYear()).padStart(4, "0") +
      ("" + date.getMonth()).padStart(2, "0") +
      ("" + date.getDate()).padStart(2, "0"),
  );
}

/**
 * @param timezoneOffset UTC+9 = 9*60 = 540
 */
export function getTimeZonedDate(timezoneOffset: number) {
  const d = new Date();
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes() + timezoneOffset,
    d.getUTCSeconds(),
    d.getUTCMilliseconds(),
  );
}

export const isInvalidDate = (date: Date) => Number.isNaN(date.getTime());
