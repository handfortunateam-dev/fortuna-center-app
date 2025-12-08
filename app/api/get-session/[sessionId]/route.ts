// import { NextResponse } from 'next/server';
// import { db } from '@/db';
// import { sessions } from '@/db/schema';
// import { eq } from 'drizzle-orm';

// export async function GET(
//   request: Request,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     // Await params in Next.js 15+ / 16 if needed, though usually params is an object in 14/15.
//     // In Next 15+ params might be a promise, but for now treating as standard object or awaiting if necessary.
//     // Safe approach:
//     const { sessionId } = await Promise.resolve(params); 
    
//     const result = await db.query.sessions.findFirst({
//       where: eq(sessions.id, sessionId),
//     });

//     if (!result) {
//       return NextResponse.json({ error: 'Session not found' }, { status: 404 });
//     }

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('Error fetching session:', error);
//     return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
//   }
// }
