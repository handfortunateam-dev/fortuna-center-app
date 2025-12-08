import { NextResponse } from 'next/server';
import { db } from '@/db';
import { liveSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    req: Request,
    { params }: { params: { sessionId: string } }
) {
    try {
        const session = await db.query.liveSessions.findFirst({
            where: eq(liveSessions.id, params.sessionId),
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        if (session.inputType !== 'rtmp') {
            return NextResponse.json({ error: 'Not an RTMP session' }, { status: 400 });
        }

        return NextResponse.json({
            streamKey: session.streamKey,
            rtmpUrl: session.rtmpUrl,
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
