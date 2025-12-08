import { NextResponse } from 'next/server';
import { db } from '@/db';
import { liveSessions } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

// Mock LiveKit/Ingress Client
const createIngress = async (roomName: string) => {
    // In a real app, this calls LiveKit Ingress API
    return {
        ingressId: `ingress_${uuidv4()}`,
        url: 'rtmp://ingress.livekit.io/live',
        streamKey: `sk_${uuidv4().substring(0, 8)}`,
    };
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, inputType, scheduledTime, isPublic } = body;

        const roomId = `room_${uuidv4()}`;
        let ingressData = null;

        // If RTMP, create Ingress resource
        if (inputType === 'rtmp') {
            ingressData = await createIngress(roomId);
        }

        // Save to DB
        const [session] = await db.insert(liveSessions).values({
            title,
            description,
            inputType,
            status: 'pending',
            roomId,
            ingressId: ingressData?.ingressId,
            rtmpUrl: ingressData?.url,
            streamKey: ingressData?.streamKey,
            isPublic,
            scheduledAt: scheduledTime ? new Date(scheduledTime) : null,
        }).returning();

        return NextResponse.json({
            success: true,
            session,
            // Return connection details if browser based
            connectionDetails: inputType === 'browser' ? {
                token: 'mock_token_for_browser_broadcaster',
                wsUrl: 'wss://your-livekit-project.livekit.cloud',
            } : null
        });

    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}
