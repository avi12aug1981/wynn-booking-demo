using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Wynn.Booking.Domain.Entities;

namespace Wynn.Booking.Infrastructure.Persistence.Configurations;

public sealed class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable("Rooms");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Type).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.PricePerNight).HasPrecision(18, 2);
        builder.Property(x => x.Rating).HasPrecision(3, 1);
        builder.Property(x => x.Amenities).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.ImageUrl).HasMaxLength(500);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Type);
    }
}
