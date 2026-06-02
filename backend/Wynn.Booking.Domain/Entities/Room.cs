using Wynn.Booking.Domain.Enums;

namespace Wynn.Booking.Domain.Entities;

public class Room
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int MaxGuests { get; set; }
    public string Amenities { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool PetsAllowed { get; set; }
    public bool SmokingAllowed { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public RoomStatus Status { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Booking> Bookings { get; set; } = [];
    public ICollection<BookingSession> BookingSessions { get; set; } = [];
}
