import { NextResponse } from "next/server";
import { db } from "@/db";
import { tickets } from "@/db/schema/tickets.schema";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const isDev = user.role === "DEVELOPER";

    let userTickets;

    if (isDev) {
      // Admin sees all tickets
      userTickets = await db
        .select()
        .from(tickets)
        .orderBy(desc(tickets.createdAt));
    } else {
      // Regular user sees only their tickets
      userTickets = await db
        .select()
        .from(tickets)
        .where(eq(tickets.userId, user.id))
        .orderBy(desc(tickets.createdAt));
    }

    return NextResponse.json({
      success: true,
      data: userTickets,
    });
  } catch (error) {
    console.error("[TICKETS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subject, category, description } = body;

    if (!subject || !category || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newTicket = await db
      .insert(tickets)
      .values({
        userId: user.id,
        subject,
        category,
        description,
        status: "open",
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newTicket[0],
      message: "Ticket created successfully",
    });
  } catch (error) {
    console.error("[TICKETS_POST]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
