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

        // In a real app, generate a Viewer Token for LiveKit
        const viewerToken = "mock_viewer_token_" + session.id;

        return NextResponse.json({
            type: 'livekit',
            wsUrl: 'wss://your-livekit-project.livekit.cloud',
            token: viewerToken,
            // Fallback HLS URL if Egress is set up
            hlsUrl: `https://cdn.your-domain.com/hls/${session.roomId}/index.m3u8`,
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
