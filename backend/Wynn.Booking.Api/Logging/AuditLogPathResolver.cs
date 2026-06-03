using Wynn.Booking.Api.Configuration;

namespace Wynn.Booking.Api.Logging;

public static class AuditLogPathResolver
{
    public static string Resolve(IHostEnvironment environment, IConfiguration configuration)
    {
        var options = configuration
            .GetSection(AuditLogOptions.SectionName)
            .Get<AuditLogOptions>() ?? new AuditLogOptions();

        var configuredPath = options.Path;

        if (string.IsNullOrWhiteSpace(configuredPath))
        {
            configuredPath = "../../logs/wynn-booking-audit.jsonl";
        }

        return Path.IsPathRooted(configuredPath)
            ? configuredPath
            : Path.GetFullPath(Path.Combine(environment.ContentRootPath, configuredPath));
    }
}
