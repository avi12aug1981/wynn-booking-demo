/** Card is valid through the end of the expiry month (inclusive). */
export function isCardExpiryValid(month: string, year: string): boolean {
  const monthNum = Number(month);
  const yearNum = Number(year);

  if (
    !Number.isInteger(monthNum) ||
    monthNum < 1 ||
    monthNum > 12 ||
    !Number.isInteger(yearNum)
  ) {
    return false;
  }

  const now = new Date();
  const currentIndex = now.getFullYear() * 12 + (now.getMonth() + 1);
  const expiryIndex = yearNum * 12 + monthNum;

  return expiryIndex >= currentIndex;
}

export function getCardExpiryYearOptions(yearCount = 8): number[] {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: yearCount }, (_, index) => currentYear + index);
}

export function getCardExpiryMonthOptions(year: number): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startMonth = year === currentYear ? now.getMonth() + 1 : 1;

  return Array.from({ length: 12 - startMonth + 1 }, (_, index) =>
    String(startMonth + index).padStart(2, "0")
  );
}
