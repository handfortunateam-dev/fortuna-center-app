
import { NextResponse } from "next/server";
import { db } from "@/db";
import { lessonMaterials } from "@/db/schema/lesson-material.schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newMaterial = await db.insert(lessonMaterials).values(body).returning();
        return NextResponse.json(newMaterial[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create material" }, { status: 500 });
    }
}
