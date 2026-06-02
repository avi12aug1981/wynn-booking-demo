import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type SendEmailResult = {
  sent: boolean;
  mode: "smtp" | "demo-log";
  messageId?: string;
};

function getSmtpCredentials() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    return null;
  }

  return { user, pass };
}

function isGmailSmtp() {
  const service = process.env.SMTP_SERVICE?.trim().toLowerCase();
  const host = process.env.SMTP_HOST?.trim().toLowerCase();

  return service === "gmail" || host === "smtp.gmail.com";
}

function isSmtpConfigured() {
  return isGmailSmtp()
    ? Boolean(getSmtpCredentials())
    : Boolean(process.env.SMTP_HOST?.trim() && getSmtpCredentials());
}

function createGmailTransport() {
  const auth = getSmtpCredentials();

  if (!auth) {
    throw new Error(
      "Gmail SMTP requires SMTP_USER and SMTP_PASS (Google App Password) in .env"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth,
  });
}

function createSmtpTransport() {
  const auth = getSmtpCredentials();
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure =
    process.env.SMTP_SECURE === "true" || (Number.isFinite(port) && port === 465);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: auth ?? undefined,
    requireTLS: !secure,
  } satisfies SMTPTransport.Options);
}

function createTransport() {
  if (isGmailSmtp()) {
    return createGmailTransport();
  }

  return createSmtpTransport();
}

export function getReservationEmailFromAddress() {
  return (
    process.env.RESERVATION_EMAIL_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "reservations@wynn-booking-demo.local"
  );
}

export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const from = getReservationEmailFromAddress();

  if (!isSmtpConfigured()) {
    console.info("[demo-email] Reservation confirmation (SMTP not configured)", {
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });

    return { sent: true, mode: "demo-log" };
  }

  const transport = createTransport();

  const info = await transport.sendMail({
    from: `"Wynn Reservations" <${from}>`,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return {
    sent: true,
    mode: "smtp",
    messageId: info.messageId,
  };
}
