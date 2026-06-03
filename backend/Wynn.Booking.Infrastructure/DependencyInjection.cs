using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Wynn.Booking.Application.Abstractions.Notifications;
using Wynn.Booking.Application.Abstractions.Persistence;
using Wynn.Booking.Application.BookingSessions;
using Wynn.Booking.Application.Bookings;
using Wynn.Booking.Application.Rooms;
using Wynn.Booking.Infrastructure.Configuration;
using Wynn.Booking.Infrastructure.Persistence;
using Wynn.Booking.Infrastructure.Repositories;
using Wynn.Booking.Infrastructure.Services;

namespace Wynn.Booking.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("BookingDatabase")
            ?? throw new InvalidOperationException(
                "Connection string 'BookingDatabase' is not configured.");

        services.AddDbContext<BookingDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
            {
                sql.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorNumbersToAdd: null);
                sql.MigrationsAssembly(typeof(BookingDbContext).Assembly.FullName);
            }));

        services.AddOptions<ReservationEmailOptions>()
            .Bind(configuration.GetSection(ReservationEmailOptions.SectionName));

        services.AddScoped<IHealthCheckService, HealthCheckService>();
        services.AddScoped<IReservationConfirmationNotifier, SmtpReservationConfirmationNotifier>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IBookingSessionRepository, BookingSessionRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();

        return services;
    }
}
