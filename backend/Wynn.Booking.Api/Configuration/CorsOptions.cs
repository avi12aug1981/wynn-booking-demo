namespace Wynn.Booking.Api.Configuration;

public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    public string[] AllowedOrigins { get; init; } = ["http://localhost:3000"];
}
