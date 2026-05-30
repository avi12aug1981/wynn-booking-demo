export function generateBookingReference(): string {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replaceAll("-", "");
    const randomPart = Math.floor(100000 + Math.random() * 900000);
  
    return `WYNN-${datePart}-${randomPart}`;
  }
  
  export function generatePaymentTransactionId(): string {
    const randomPart = Math.floor(100000 + Math.random() * 900000);
  
    return `PAY-${randomPart}`;
  }