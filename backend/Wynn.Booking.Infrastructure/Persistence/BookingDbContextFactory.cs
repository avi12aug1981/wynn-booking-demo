using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Wynn.Booking.Infrastructure.Persistence;

/// <summary>
/// Used by <c>dotnet ef</c> so migrations load the same connection string as the API
/// without starting the full web host (avoids noisy HostAbortedException logs).
/// </summary>
public sealed class BookingDbContextFactory : IDesignTimeDbContextFactory<BookingDbContext>
{
    public BookingDbContext CreateDbContext(string[] args)
    {
        var apiProjectPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "Wynn.Booking.Api");
        if (!File.Exists(Path.Combine(apiProjectPath, "appsettings.json")))
        {
            apiProjectPath = Directory.GetCurrentDirectory();
        }

        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var configuration = new ConfigurationBuilder()
            .SetBasePath(apiProjectPath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("BookingDatabase")
            ?? throw new InvalidOperationException(
                "Connection string 'BookingDatabase' is not configured. " +
                "Set it in appsettings.Development.json or ConnectionStrings__BookingDatabase.");

        var options = new DbContextOptionsBuilder<BookingDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new BookingDbContext(options);
    }
}
