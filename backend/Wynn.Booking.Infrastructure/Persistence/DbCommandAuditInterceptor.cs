using System.Data.Common;
using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
namespace Wynn.Booking.Infrastructure.Persistence;

/// <summary>
/// Logs each EF command to the shared audit file with the same trace id as the HTTP request.
/// </summary>
public sealed class DbCommandAuditInterceptor(
    IHttpContextAccessor httpContextAccessor,
    ILogger<DbCommandAuditInterceptor> logger) : DbCommandInterceptor
{
    private const string TraceIdItemKey = "Wynn.ApiTraceId";
    private const string ClientOperationItemKey = "Wynn.ClientOperation";
    private const int MaxCommandTextLength = 500;

    public override DbDataReader ReaderExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result)
    {
        LogCommand(eventData, command);
        return base.ReaderExecuted(command, eventData, result);
    }

    public override ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result,
        CancellationToken cancellationToken = default)
    {
        LogCommand(eventData, command);
        return base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
    }

    public override int NonQueryExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        int result)
    {
        LogCommand(eventData, command);
        return base.NonQueryExecuted(command, eventData, result);
    }

    public override ValueTask<int> NonQueryExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        LogCommand(eventData, command);
        return base.NonQueryExecutedAsync(command, eventData, result, cancellationToken);
    }

    public override object? ScalarExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        object? result)
    {
        LogCommand(eventData, command);
        return base.ScalarExecuted(command, eventData, result);
    }

    public override ValueTask<object?> ScalarExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        object? result,
        CancellationToken cancellationToken = default)
    {
        LogCommand(eventData, command);
        return base.ScalarExecutedAsync(command, eventData, result, cancellationToken);
    }

    private void LogCommand(CommandExecutedEventData eventData, DbCommand command)
    {
        var context = httpContextAccessor.HttpContext;
        var traceId = "no-http-context";

        if (context?.Items.TryGetValue(TraceIdItemKey, out var traceValue) == true
            && traceValue is string storedTraceId)
        {
            traceId = storedTraceId;
        }
        else if (context != null)
        {
            traceId = context.TraceIdentifier;
        }

        string? operation = null;

        if (context?.Items.TryGetValue(ClientOperationItemKey, out var opValue) == true)
        {
            operation = opValue as string;
        }

        var commandText = command.CommandText;

        if (commandText.Length > MaxCommandTextLength)
        {
            commandText = commandText[..MaxCommandTextLength] + "…";
        }

        using (logger.BeginScope(new Dictionary<string, object?>
        {
            ["Layer"] = "Database",
            ["TraceId"] = traceId,
            ["Operation"] = operation,
        }))
        {
            logger.LogInformation(
                "SQL {CommandType} duration={DurationMs}ms: {CommandText}",
                command.CommandType,
                eventData.Duration.TotalMilliseconds,
                commandText);
        }
    }
}
