import { NextResponse } from 'next/server';
import { db } from '@/db';
import { liveSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Webhook handler for LiveKit events
 * This receives callbacks when:
 * - Ingress stream starts/stops (RTMP)
 * - Participants join/leave
 * - Recording starts/stops
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event, ingressId, roomName } = body;

        console.log('LiveKit Webhook:', event, { ingressId, roomName });

        // Handle different event types
        switch (event) {
            case 'ingress_started':
                // RTMP stream has started
                await db.update(liveSessions)
                    .set({
                        status: 'live',
                        startedAt: new Date()
                    })
                    .where(eq(liveSessions.ingressId, ingressId));
                break;

            case 'ingress_ended':
                // RTMP stream has ended
                await db.update(liveSessions)
                    .set({
                        status: 'ended',
                        endedAt: new Date()
                    })
                    .where(eq(liveSessions.ingressId, ingressId));
                break;

            case 'room_started':
                // First participant joined (for browser-based streams)
                await db.update(liveSessions)
                    .set({
                        status: 'live',
                        startedAt: new Date()
                    })
                    .where(eq(liveSessions.roomId, roomName));
                break;

            case 'room_finished':
                // All participants left
                await db.update(liveSessions)
                    .set({
                        status: 'ended',
                        endedAt: new Date()
                    })
                    .where(eq(liveSessions.roomId, roomName));
                break;

            default:
                console.log('Unhandled event:', event);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
