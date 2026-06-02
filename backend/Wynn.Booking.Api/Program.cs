using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Serilog;
using Wynn.Booking.Api;
using Wynn.Booking.Api.Middleware;
using Wynn.Booking.Application;
using Wynn.Booking.Infrastructure;
using Wynn.Booking.Infrastructure.Persistence;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Application", "Wynn.Booking.Api")
            .WriteTo.Console());

    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddApiServices(builder.Configuration);

    builder.Services.AddHealthChecks()
        .AddDbContextCheck<BookingDbContext>("sqlserver", tags: ["ready", "db"]);

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        await DatabaseInitializer.InitializeAsync(dbContext, logger);
    }
    else
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
        await dbContext.Database.MigrateAsync();
    }

    app.UseMiddleware<CorrelationIdMiddleware>();
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseMiddleware<ApiKeyMiddleware>();

    if (!app.Environment.IsProduction())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Wynn Booking API v1");
            options.RoutePrefix = "swagger";
        });
    }

    app.UseCors("WynnBookingCors");
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
