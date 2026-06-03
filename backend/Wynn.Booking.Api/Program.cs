using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Serilog;
using Wynn.Booking.Api;
using Wynn.Booking.Api.Middleware;
using Wynn.Booking.Application;
using Wynn.Booking.Infrastructure;
using Wynn.Booking.Infrastructure.Persistence;

try
{
    var builder = WebApplication.CreateBuilder(args);

    var logFilePath = Path.Combine(builder.Environment.ContentRootPath, "logs", "wynn-booking-api-.log");

    Log.Logger = new LoggerConfiguration()
        .Enrich.FromLogContext()
        .WriteTo.File(
            logFilePath,
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 14,
            flushToDiskInterval: TimeSpan.FromSeconds(1),
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] TraceId={TraceId} {Message:lj}{NewLine}{Exception}")
        .CreateLogger();

    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Application", "Wynn.Booking.Api")
            .WriteTo.File(
                logFilePath,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 14,
                flushToDiskInterval: TimeSpan.FromSeconds(1),
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] TraceId={TraceId} {Message:lj}{NewLine}{Exception}"));

    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddApiServices(builder.Configuration);

    builder.Services.AddHealthChecks()
        .AddDbContextCheck<BookingDbContext>("sqlserver", tags: ["ready", "db"]);

    var app = builder.Build();

    Log.Information("Serilog file log path: {LogFilePath}", logFilePath);

    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        await DatabaseInitializer.InitializeAsync(
            dbContext,
            logger,
            app.Configuration);
    }
    else
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
