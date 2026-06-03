using System.Text.Json;
using System.Text.Json.Serialization;

namespace Wynn.Booking.Api.Configuration;

/// <summary>
/// Repo-root <c>config/development.defaults.json</c> — used only when URL settings are empty in Development.
/// </summary>
public static class DevelopmentDefaults
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static bool TryGetUrls(IHostEnvironment environment, out DevelopmentUrls urls)
    {
        urls = new DevelopmentUrls();

        if (!environment.IsDevelopment())
        {
            return false;
        }

        var path = ResolveFilePath(environment.ContentRootPath);

        if (!File.Exists(path))
        {
            return false;
        }

        var json = File.ReadAllText(path);
        var file = JsonSerializer.Deserialize<DevelopmentDefaultsFile>(json, JsonOptions);

        if (file?.Urls.AppBase is not { Length: > 0 } appBase
            || file.Urls.BookingApi is not { Length: > 0 } bookingApi)
        {
            return false;
        }

        urls = new DevelopmentUrls(appBase, bookingApi);
        return true;
    }

    public static string[] ResolveCorsOrigins(
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var configured = configuration
            .GetSection($"{CorsOptions.SectionName}:AllowedOrigins")
            .Get<string[]>();

        if (configured is { Length: > 0 })
        {
            return configured;
        }

        if (TryGetUrls(environment, out var urls))
        {
            return [urls.AppBase];
        }

        throw new InvalidOperationException(
            "Cors:AllowedOrigins is not configured. Set it in appsettings or environment variables.");
    }

    public static string ResolveClientBaseUrl(
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var configured = configuration["ReservationEmail:ClientBaseUrl"];

        if (!string.IsNullOrWhiteSpace(configured))
        {
            return configured.TrimEnd('/');
        }

        if (TryGetUrls(environment, out var urls))
        {
            return urls.AppBase;
        }

        throw new InvalidOperationException(
            "ReservationEmail:ClientBaseUrl is not configured. Set it in appsettings or environment variables.");
    }

    private static string ResolveFilePath(string contentRootPath) =>
        Path.GetFullPath(Path.Combine(contentRootPath, "../../config/development.defaults.json"));

    private sealed class DevelopmentDefaultsFile
    {
        [JsonPropertyName("urls")]
        public DevelopmentUrlsDto Urls { get; init; } = new();
    }

    private sealed class DevelopmentUrlsDto
    {
        [JsonPropertyName("appBase")]
        public string AppBase { get; init; } = string.Empty;

        [JsonPropertyName("bookingApi")]
        public string BookingApi { get; init; } = string.Empty;
    }

    public readonly record struct DevelopmentUrls(string AppBase, string BookingApi);
}
