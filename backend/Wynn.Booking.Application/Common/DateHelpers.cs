using Wynn.Booking.Application.Common.Validation;

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

    /// <summary>Calendar "today" at the property (Wynn Las Vegas — Pacific).</summary>
    public static DateOnly HotelTodayDateOnly()
    {
        const string hotelTimeZoneId = "America/Los_Angeles";

        try
        {
            var hotelZone = TimeZoneInfo.FindSystemTimeZoneById(hotelTimeZoneId);
            var hotelNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, hotelZone);
            return DateOnly.FromDateTime(hotelNow);
        }
        catch (TimeZoneNotFoundException)
        {
            return DateOnly.FromDateTime(DateTime.Now);
        }
    }

    public static DateTime StartOfTodayUtc()
    {
        return HotelTodayDateOnly().ToDateTime(TimeOnly.MinValue);
    }

    public static (bool IsValid, string? ErrorMessage) ValidateStayDateRange(
        string checkInDate,
        string checkOutDate)
    {
        var checkIn = ParseDateOnly(checkInDate);
        var checkOut = ParseDateOnly(checkOutDate);
        var today = HotelTodayDateOnly();

        if (checkIn is null || checkOut is null)
        {
            return (false, ApplicationMessages.Validation.ValidStayDates);
        }

        var checkInDay = DateOnly.FromDateTime(checkIn.Value);
        var checkOutDay = DateOnly.FromDateTime(checkOut.Value);

        if (checkInDay < today)
        {
            return (false, ApplicationMessages.Validation.CheckInCannotBePast);
        }

        if (checkOutDay < today)
        {
            return (false, ApplicationMessages.Validation.CheckOutCannotBePast);
        }

        if (checkOutDay <= checkInDay)
        {
            return (false, ApplicationMessages.Validation.CheckOutAfterCheckIn);
        }

        return (true, null);
    }
}
