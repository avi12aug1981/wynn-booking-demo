using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wynn.Booking.Domain.Entities;
using BookingEntity = Wynn.Booking.Domain.Entities.Booking;

namespace Wynn.Booking.Infrastructure.Persistence.Configurations;

public sealed class BookingConfiguration : IEntityTypeConfiguration<BookingEntity>
{
    public void Configure(EntityTypeBuilder<BookingEntity> builder)
    {
        builder.ToTable("Bookings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ReferenceNumber).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.ReferenceNumber).IsUnique();
        builder.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(x => x.LastName).HasMaxLength(50).IsRequired();
        builder.Property(x => x.ContactEmail).HasMaxLength(200).IsRequired();
        builder.Property(x => x.PricePerNight).HasPrecision(18, 2);
        builder.Property(x => x.DiscountAmount).HasPrecision(18, 2);
        builder.Property(x => x.TaxAmount).HasPrecision(18, 2);
        builder.Property(x => x.TotalPrice).HasPrecision(18, 2);
        builder.HasIndex(x => new { x.RoomId, x.CheckInDate, x.CheckOutDate });
        builder.HasIndex(x => x.Status);

        builder.HasOne(x => x.Room)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.RoomId);

        builder.HasOne(x => x.BookingSession)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.BookingSessionId);
    }
}

public sealed class BookingGuestConfiguration : IEntityTypeConfiguration<BookingGuest>
{
    public void Configure(EntityTypeBuilder<BookingGuest> builder)
    {
        builder.ToTable("BookingGuests");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.BookingId, x.Sequence }).IsUnique();
        builder.HasOne(x => x.Booking)
            .WithMany(x => x.Guests)
            .HasForeignKey(x => x.BookingId);
    }
}
