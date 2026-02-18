import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { podcastComments } from "@/db/schema/podcast-comment.schema";
import { podcastEpisodes } from "@/db/schema/podcast-episode.schema";
import { users } from "@/db/schema/users.schema";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: episodeId } = await context.params;

    // Verify episode exists
    const [episode] = await db
      .select({ id: podcastEpisodes.id })
      .from(podcastEpisodes)
      .where(eq(podcastEpisodes.id, episodeId))
      .limit(1);

    if (!episode) {
      return NextResponse.json({ success: false, message: "Episode not found" }, { status: 404 });
    }

    const allComments = await db
      .select({
        id: podcastComments.id,
        content: podcastComments.content,
        createdAt: podcastComments.createdAt,
        isEdited: podcastComments.isEdited,
        parentId: podcastComments.parentId,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(podcastComments)
      .leftJoin(users, eq(podcastComments.authorId, users.id))
      .where(eq(podcastComments.episodeId, episodeId))
      .orderBy(desc(podcastComments.createdAt));

    // Build threaded structure
    const commentMap = new Map<string, any>();
    const rootComments: any[] = [];

    for (const comment of allComments) {
      commentMap.set(comment.id, { ...comment, replies: [] });
    }

    for (const comment of allComments) {
      const node = commentMap.get(comment.id);
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId).replies.push(node);
      } else {
        rootComments.push(node);
      }
    }

    return NextResponse.json({ success: true, data: rootComments });
  } catch (error) {
    console.error("Error fetching episode comments:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to comment." },
        { status: 401 }
      );
    }

    const { id: episodeId } = await context.params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Comment content is required." }, { status: 400 });
    }

    // Verify episode exists
    const [episode] = await db
      .select({ id: podcastEpisodes.id })
      .from(podcastEpisodes)
      .where(eq(podcastEpisodes.id, episodeId))
      .limit(1);

    if (!episode) {
      return NextResponse.json({ success: false, message: "Episode not found" }, { status: 404 });
    }

    // If replying, verify parent comment exists
    if (parentId) {
      const [parent] = await db
        .select({ id: podcastComments.id })
        .from(podcastComments)
        .where(eq(podcastComments.id, parentId))
        .limit(1);

      if (!parent) {
        return NextResponse.json({ success: false, message: "Parent comment not found" }, { status: 404 });
      }
    }

    const [newComment] = await db
      .insert(podcastComments)
      .values({
        episodeId,
        authorId: user.id,
        content: content.trim(),
        parentId: parentId || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        ...newComment,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
        replies: [],
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
