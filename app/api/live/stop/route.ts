import { NextResponse } from 'next/server';
import { db } from '@/db';
import { liveSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sessionId } = body;

        const [session] = await db.update(liveSessions)
            .set({
                status: 'ended',
                endedAt: new Date()
            })
            .where(eq(liveSessions.id, sessionId))
            .returning();

        // In a real app, this would also:
        // - Delete the LiveKit Ingress if RTMP
        // - Stop any Egress recordings
        // - Disconnect all participants

        return NextResponse.json({
            success: true,
            session
        });

    } catch (error) {
        console.error('Error stopping session:', error);
        return NextResponse.json({ error: 'Failed to stop session' }, { status: 500 });
    }
}
