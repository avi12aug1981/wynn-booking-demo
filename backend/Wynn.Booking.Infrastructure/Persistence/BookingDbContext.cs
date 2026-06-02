using Microsoft.EntityFrameworkCore;
using Wynn.Booking.Domain.Entities;
using BookingEntity = Wynn.Booking.Domain.Entities.Booking;

namespace Wynn.Booking.Infrastructure.Persistence;

public sealed class BookingDbContext(DbContextOptions<BookingDbContext> options) : DbContext(options)
{
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<BookingEntity> Bookings => Set<BookingEntity>();
    public DbSet<BookingGuest> BookingGuests => Set<BookingGuest>();
    public DbSet<BookingSession> BookingSessions => Set<BookingSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BookingDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
