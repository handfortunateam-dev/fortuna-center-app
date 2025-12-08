// import { NextResponse } from 'next/server';
// import { db } from '@/db';
// import { sessions } from '@/db/schema';
// import { nanoid } from 'nanoid';

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { youtubeVideoId } = body;

//     if (!youtubeVideoId) {66 is required' }, { status: 400 });
//     }

//     const sessionId = nanoid(10);

//     await db.insert(sessions).values({
//       id: sessionId,
//       youtubeVideoId,
//     });

//     return NextResponse.json({ sessionId });
//   } catch (error) {
//     console.error('Error creating session:', error);
//     return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
//   }
// }
