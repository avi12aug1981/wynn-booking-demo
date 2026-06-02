namespace Wynn.Booking.Api.Configuration;

public sealed class ApiSecurityOptions
{
    public const string SectionName = "ApiSecurity";

    public string ApiKeyHeaderName { get; init; } = "x-api-key";

    public string InternalApiKey { get; init; } = "wynn-demo-2026";

    public bool RequireApiKeyForBookingSessions { get; init; } = true;
}
