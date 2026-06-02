using Wynn.Booking.Domain.Enums;

namespace Wynn.Booking.Domain.Entities;

public class BookingSession
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public int GuestCount { get; set; }
    public BookingSessionStatus Status { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Room Room { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = [];
}
