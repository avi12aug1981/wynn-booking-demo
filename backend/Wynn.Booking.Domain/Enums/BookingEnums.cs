namespace Wynn.Booking.Domain.Enums;

public enum BookingType
{
    Guest = 0,
    Member = 1,
}

public enum BookingStatus
{
    Confirmed = 0,
    Cancelled = 1,
}

public enum PaymentStatus
{
    Pending = 0,
    Paid = 1,
    Failed = 2,
    Refunded = 3,
}

public enum RoomStatus
{
    Available = 0,
    Maintenance = 1,
    OutOfService = 2,
}

public enum BookingSessionStatus
{
    Active = 0,
    Consumed = 1,
    Expired = 2,
}

public enum Gender
{
    Male = 0,
    Female = 1,
    Other = 2,
    PreferNotToSay = 3,
}

public enum AgeGroup
{
    Adult = 0,
    Child = 1,
    Infant = 2,
}
