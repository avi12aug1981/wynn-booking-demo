using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Wynn.Booking.Api.IntegrationTests;

public sealed class WynnBookingApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ApiSecurity:InternalApiKey"] = "wynn-demo-2026",
                ["ApiSecurity:RequireApiKeyForBookingSessions"] = "true",
            });
        });
    }
}
