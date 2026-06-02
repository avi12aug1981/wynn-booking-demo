namespace Wynn.Booking.Application.Common;

public static class DateHelpers
{
    public static DateTime? ParseDateOnly(string value)
    {
        if (!DateOnly.TryParse(value, out var date))
        {
            return null;
        }

        return date.ToDateTime(TimeOnly.MinValue);
    }

    public static int CalculateNumberOfNights(DateTime checkIn, DateTime checkOut)
    {
        return (int)Math.Ceiling((checkOut - checkIn).TotalDays);
    }

    public static DateTime StartOfTodayUtc()
    {
        var today = DateTime.UtcNow.Date;
        return today;
    }
}
