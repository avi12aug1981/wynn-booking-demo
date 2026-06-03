using Wynn.Booking.Domain.Enums;

namespace Wynn.Booking.Domain.Entities;

public class Member
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    /// <summary>Demo POC: plain text; production should store a password hash.</summary>
    public string PasswordHash { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public string Tier { get; set; } = "Gold";
    public MemberStatus Status { get; set; } = MemberStatus.Active;
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string Country { get; set; } = "USA";
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Booking> Bookings { get; set; } = [];
}
