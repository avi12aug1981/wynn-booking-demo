using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Wynn.Booking.Application.Auth;
using Wynn.Booking.Application.BookingSessions;
using Wynn.Booking.Application.Bookings;
using Wynn.Booking.Application.Common.Behaviors;
using Wynn.Booking.Application.Rooms;

namespace Wynn.Booking.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(configuration =>
        {
            configuration.RegisterServicesFromAssembly(assembly);
            configuration.AddOpenBehavior(typeof(LoggingBehavior<,>));
            configuration.AddOpenBehavior(typeof(PerformanceBehavior<,>));
            configuration.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(assembly);

        services.AddScoped<IRoomSearchService, RoomSearchService>();
        services.AddScoped<IBookingSessionService, BookingSessionService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
