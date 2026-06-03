export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isValidDateString(value?: string): boolean {
  if (!value) {
    return false;
  }

  return parseLocalDate(value) !== null;
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
}

export function isBeforeToday(value: string): boolean {
  const date = parseLocalDate(value);

  if (!date) {
    return true;
  }

  return date < startOfToday();
}

export function isCheckOutAfterCheckIn(checkIn: string, checkOut: string): boolean {
  const checkInDate = parseLocalDate(checkIn);
  const checkOutDate = parseLocalDate(checkOut);

  if (!checkInDate || !checkOutDate) {
    return false;
  }

  return checkOutDate > checkInDate;
}

export function todayDateInputValue(): string {
  const today = startOfToday();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDaysToDateInputValue(dateInputValue: string, days: number) {
  const date = parseLocalDate(dateInputValue);

  if (!date) {
    return todayDateInputValue();
  }

  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Ensures defaults are today+ for check-in and check-out after check-in. */
export function clampStayDateDefaults(checkIn?: string, checkOut?: string) {
  const today = todayDateInputValue();
  const resolvedCheckIn =
    checkIn && isValidDateString(checkIn) && !isBeforeToday(checkIn)
      ? checkIn
      : today;
  const resolvedCheckOut =
    checkOut &&
    isValidDateString(checkOut) &&
    !isBeforeToday(checkOut) &&
    isCheckOutAfterCheckIn(resolvedCheckIn, checkOut)
      ? checkOut
      : addDaysToDateInputValue(resolvedCheckIn, 2);

  return {
    checkInDate: resolvedCheckIn,
    checkOutDate: resolvedCheckOut,
  };
}

export function areStayDatesValid(checkIn: string, checkOut: string) {
  return (
    isValidDateString(checkIn) &&
    isValidDateString(checkOut) &&
    !isBeforeToday(checkIn) &&
    isCheckOutAfterCheckIn(checkIn, checkOut)
  );
}
