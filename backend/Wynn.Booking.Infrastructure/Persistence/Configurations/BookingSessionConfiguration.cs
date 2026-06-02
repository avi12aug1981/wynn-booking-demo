using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wynn.Booking.Domain.Entities;

namespace Wynn.Booking.Infrastructure.Persistence.Configurations;

public sealed class BookingSessionConfiguration : IEntityTypeConfiguration<BookingSession>
{
    public void Configure(EntityTypeBuilder<BookingSession> builder)
    {
        builder.ToTable("BookingSessions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Token).HasMaxLength(100).IsRequired();
        builder.HasIndex(x => x.Token).IsUnique();
        builder.HasIndex(x => x.ExpiresAt);

        builder.HasOne(x => x.Room)
            .WithMany(x => x.BookingSessions)
            .HasForeignKey(x => x.RoomId);
    }
}
