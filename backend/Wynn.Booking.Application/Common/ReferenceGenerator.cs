namespace Wynn.Booking.Application.Common;

public static class ReferenceGenerator
{
    public static string GenerateBookingReference()
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var randomPart = Random.Shared.Next(100000, 999999);
        return $"{BookingConstants.ConfirmationPrefix}-{datePart}-{randomPart}";
    }

    public static string GeneratePaymentTransactionId()
    {
        var randomPart = Random.Shared.Next(100000, 999999);
        return $"{BookingConstants.PaymentPrefix}-{randomPart}";
    }

    public static string GenerateBookingSessionToken()
    {
        var randomPart = Guid.NewGuid().ToString("N")[..16].ToUpperInvariant();
        return $"BSN_{randomPart}";
    }
}
