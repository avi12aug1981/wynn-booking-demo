using System.Threading.RateLimiting;
using Microsoft.OpenApi.Models;
using Wynn.Booking.Api.Configuration;

namespace Wynn.Booking.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<ApiSecurityOptions>(configuration.GetSection(ApiSecurityOptions.SectionName));
        services.Configure<CorsOptions>(configuration.GetSection(CorsOptions.SectionName));

        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Wynn Booking API",
                Version = "v1",
                Description = "Production-oriented hotel booking API — CQRS, validation pipeline, transactional inventory.",
            });

            var apiKeyHeader = configuration["ApiSecurity:ApiKeyHeaderName"] ?? "x-api-key";
            options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
            {
                Description = "Internal API key required for POST /api/booking-sessions",
                Name = apiKeyHeader,
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "ApiKey",
                        },
                    },
                    Array.Empty<string>()
                },
            });
        });

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy("booking-writes", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 30,
                        Window = TimeSpan.FromMinutes(1),
                    }));
        });

        var corsOrigins = configuration.GetSection(CorsOptions.SectionName).Get<string[]>()
            ?? ["http://localhost:3000"];

        services.AddCors(policy =>
        {
            policy.AddPolicy("WynnBookingCors", builder =>
            {
                builder.WithOrigins(corsOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }
}
