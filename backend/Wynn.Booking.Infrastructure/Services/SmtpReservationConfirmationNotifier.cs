using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Wynn.Booking.Application.Abstractions.Notifications;
using Wynn.Booking.Infrastructure.Configuration;
using BookingEntity = Wynn.Booking.Domain.Entities.Booking;

namespace Wynn.Booking.Infrastructure.Services;

/// <summary>
/// Sends reservation confirmation email via SMTP when configured; otherwise logs a demo preview.
/// </summary>
public sealed class SmtpReservationConfirmationNotifier(
    IOptions<ReservationEmailOptions> options,
    ILogger<SmtpReservationConfirmationNotifier> logger) : IReservationConfirmationNotifier
{
    public async Task NotifyAsync(
        BookingEntity booking,
        CancellationToken cancellationToken = default)
    {
        var settings = options.Value;
        var content = ReservationConfirmationEmailBuilder.Build(
            booking,
            settings.ClientBaseUrl);

        if (!settings.IsSmtpConfigured())
        {
            throw new InvalidOperationException(
                "Reservation email SMTP is not configured. Set ReservationEmail:Smtp:User and ReservationEmail:Smtp:Password " +
                "(or ReservationEmail__Smtp__User / ReservationEmail__Smtp__Password environment variables).");
        }

        MimeMessage message;

        try
        {
            message = BuildMimeMessage(booking.ContactEmail, settings, content);
        }
        catch (FormatException ex)
        {
            logger.LogWarning(
                ex,
                "Invalid email address for confirmation {ReferenceNumber}. ContactEmail=\"{ContactEmail}\", FromAddress=\"{FromAddress}\"",
                booking.ReferenceNumber,
                booking.ContactEmail,
                settings.FromAddress ?? settings.Smtp.User);

            throw;
        }

        using var client = new SmtpClient();
        var smtp = settings.Smtp;
        var host = smtp.ResolveHost();
        var port = smtp.Port > 0 ? smtp.Port : 587;
        var socketOptions = smtp.Secure || port == 465
            ? SecureSocketOptions.SslOnConnect
            : SecureSocketOptions.StartTls;

        await client.ConnectAsync(host, port, socketOptions, cancellationToken);
        await client.AuthenticateAsync(smtp.User!, smtp.Password!, cancellationToken);
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);

        logger.LogInformation(
            "Reservation confirmation email sent for {ReferenceNumber} to {Email}",
            booking.ReferenceNumber,
            booking.ContactEmail);
    }

    private static MimeMessage BuildMimeMessage(
        string toEmail,
        ReservationEmailOptions settings,
        ReservationConfirmationEmailBuilder.EmailContent content)
    {
        var message = new MimeMessage();

        // FromAddress may be "Display Name <email@domain.com>" — must use Parse, not MailboxAddress(name, wholeString).
        message.From.Add(
            EmailAddressParser.ParseRequired(
                settings.ResolveFromAddress(),
                "ReservationEmail:FromAddress"));

        message.To.Add(
            EmailAddressParser.ParseRequired(toEmail, "booking.ContactEmail"));

        message.Subject = content.Subject;

        var bodyBuilder = new BodyBuilder
        {
            TextBody = content.TextBody,
            HtmlBody = content.HtmlBody,
        };

        message.Body = bodyBuilder.ToMessageBody();
        return message;
    }
}
