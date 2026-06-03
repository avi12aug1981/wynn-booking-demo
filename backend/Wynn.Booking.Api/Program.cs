using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Formatting.Compact;
using Wynn.Booking.Api;
using Wynn.Booking.Api.Configuration;
using Wynn.Booking.Api.Logging;
using Wynn.Booking.Api.Middleware;
using Wynn.Booking.Application;
using Wynn.Booking.Infrastructure;
using Wynn.Booking.Infrastructure.Persistence;

try
{
    var builder = WebApplication.CreateBuilder(args);

    var auditLogPath = AuditLogPathResolver.Resolve(builder.Environment, builder.Configuration);
    Directory.CreateDirectory(Path.GetDirectoryName(auditLogPath)!);

    builder.Services.Configure<AuditLogOptions>(
        builder.Configuration.GetSection(AuditLogOptions.SectionName));

    Log.Logger = new LoggerConfiguration()
        .ReadFrom.Configuration(builder.Configuration)
        .Filter.With<SerilogSensitiveDataFilter>()
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "Wynn.Booking.Api")
        .Enrich.WithProperty("Layer", "API")
        .WriteTo.File(
            new CompactJsonFormatter(),
            auditLogPath,
            shared: true,
            flushToDiskInterval: TimeSpan.FromSeconds(1))
        .CreateLogger();

    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Filter.With<SerilogSensitiveDataFilter>()
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Application", "Wynn.Booking.Api")
            .Enrich.WithProperty("Layer", "API")
            .WriteTo.File(
                new CompactJsonFormatter(),
                auditLogPath,
                shared: true,
                flushToDiskInterval: TimeSpan.FromSeconds(1)));

    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddApiServices(builder.Configuration, builder.Environment);

    builder.Services.AddHealthChecks()
        .AddDbContextCheck<BookingDbContext>("sqlserver", tags: ["ready", "db"]);

    var app = builder.Build();

    Log.Information("Unified audit log path: {AuditLogPath}", auditLogPath);

    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        await DatabaseInitializer.InitializeAsync(
            dbContext,
            logger,
            app.Configuration);
    }

    app.UseMiddleware<CorrelationIdMiddleware>();
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseCors("WynnBookingCors");
    app.UseMiddleware<ApiKeyMiddleware>();
    app.UseMiddleware<RequestCompletionLoggingMiddleware>();

    app.UseAuthentication();
    app.UseMiddleware<MemberAuditEnrichmentMiddleware>();
    app.UseAuthorization();

    if (!app.Environment.IsProduction())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Wynn Booking API v1");
            options.RoutePrefix = "swagger";
        });
    }
    app.UseRateLimiter();
    app.MapControllers();

    app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
    {
        Predicate = check => check.Tags.Contains("ready"),
    });
    app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
    {
        Predicate = _ => false,
    });

    if (!app.Environment.IsProduction())
    {
        app.MapGet("/", () => Results.Redirect("/swagger"));
    }

    app.Run();
}
catch (HostAbortedException)
{
    // EF Core design-time tools abort the host after reading services.
}
catch (Exception exception)
{
    Log.Fatal(exception, "Application terminated unexpectedly");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program;
