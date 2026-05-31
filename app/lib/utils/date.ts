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
