import { NextResponse } from "next/server";
import { appendAuditEvent } from "@/lib/logging/append-audit-server";
import type { AuditLogEvent } from "@/lib/logging/audit-event";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AuditLogEvent;

    if (!body?.traceId || !body?.layer || !body?.message) {
      return NextResponse.json(
        { success: false, message: "Invalid audit payload." },
        { status: 400 }
      );
    }

    appendAuditEvent({
      ...body,
      timestamp: body.timestamp ?? new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to write audit log." },
      { status: 400 }
    );
  }
}
