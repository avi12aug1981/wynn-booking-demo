namespace Wynn.Booking.Api.Configuration;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "Wynn.Booking.Api";

    public string Audience { get; init; } = "Wynn.Booking.Client";

    public string SecretKey { get; init; } = string.Empty;

    public int ExpirationMinutes { get; init; } = 60;
}
