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
                ["Jwt:SecretKey"] = "WynnBookingDemoJwtSigningKey_ForIntegrationTests_2026",
                ["Jwt:Issuer"] = "Wynn.Booking.Api",
                ["Jwt:Audience"] = "Wynn.Booking.Client",
                ["DemoAuth:Members:0:MemberId"] = "1",
                ["DemoAuth:Members:0:Email"] = "demo.member@wynn.local",
                ["DemoAuth:Members:0:Password"] = "demo.member",
                ["DemoAuth:Members:0:FirstName"] = "Avadesh",
                ["DemoAuth:Members:0:LastName"] = "Demo Member",
                ["DemoAuth:Members:0:Tier"] = "Gold",
                ["ApiSecurity:InternalApiKey"] = "wynn-demo-2026",
                ["ApiSecurity:RequireApiKeyForBookingSessions"] = "true",
            });
        });
    }
}
