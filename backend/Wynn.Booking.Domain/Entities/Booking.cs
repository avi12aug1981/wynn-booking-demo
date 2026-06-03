using Wynn.Booking.Domain.Enums;

namespace Wynn.Booking.Domain.Entities;

public class Booking
{
    public int Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public int? MemberId { get; set; }
    public int? BookingSessionId { get; set; }
    public BookingType BookingType { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public string ContactEmail { get; set; } = string.Empty;
    public int AdultCount { get; set; }
    public int ChildCount { get; set; }
    public int InfantCount { get; set; }
    public int PetCount { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public string? SpecialRequests { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = "USA";
    public decimal PricePerNight { get; set; }
    public int NumberOfNights { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalPrice { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? PaymentTransactionId { get; set; }
    public BookingStatus Status { get; set; }
    public bool ConfirmationEmailSent { get; set; }
    public string BookingSource { get; set; } = "WEB";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Room Room { get; set; } = null!;
    public Member? Member { get; set; }
    public BookingSession? BookingSession { get; set; }
    public ICollection<BookingGuest> Guests { get; set; } = [];
}

public class BookingGuest
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int Sequence { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Gender? Gender { get; set; }
    public AgeGroup AgeGroup { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Booking Booking { get; set; } = null!;
}
