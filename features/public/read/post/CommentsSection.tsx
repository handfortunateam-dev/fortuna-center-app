"use client";

import { useState } from "react";
import { Avatar, Button, Textarea, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { StateMessage } from "@/components/state-message";
import { useGetIdentity } from "@/hooks/useGetIdentity";
import {
  usePostComments,
  useCreateComment,
  useDeleteComment,
  PostCommentData,
} from "@/services/blogService";

interface CommentsSectionProps {
  postId: string;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function CommentItem({
  comment,
  postId,
  currentUserId,
  depth = 0,
}: {
  comment: PostCommentData;
  postId: string;
  currentUserId?: string;
  depth?: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const handleReply = () => {
    if (!replyContent.trim()) return;
    createComment.mutate(
      { postId, content: replyContent.trim(), parentId: comment.id },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplyOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteComment.mutate({ commentId: comment.id, postId });
  };

  const isOwner = currentUserId === comment.author?.id;

  return (
    <div className={depth > 0 ? "ml-10 border-l-2 border-default-200 pl-4" : ""}>
      <div className="flex gap-3 py-4">
        <Avatar
          src={comment.author?.image || undefined}
          name={comment.author?.name || "User"}
          size="sm"
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Text as="span" size="sm" weight="semibold">
              {comment.author?.name || "Unknown User"}
            </Text>
            <Text as="span" size="xs" color="muted">
              {formatTimeAgo(comment.createdAt)}
            </Text>
            {comment.isEdited && (
              <Text as="span" size="xs" color="muted">
                (edited)
              </Text>
            )}
          </div>

          <Text size="sm" color="secondary" className="mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </Text>

          <div className="flex items-center gap-1 mt-2">
            {currentUserId && depth < 2 && (
              <Button
                variant="light"
                size="sm"
                startContent={<Icon icon="solar:reply-linear" className="text-base" />}
                onPress={() => setReplyOpen(!replyOpen)}
              >
                Reply
              </Button>
            )}
            {isOwner && (
              <Button
                variant="light"
                size="sm"
                color="danger"
                isLoading={deleteComment.isPending}
                startContent={<Icon icon="solar:trash-bin-minimalistic-linear" className="text-base" />}
                onPress={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>

          {replyOpen && (
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder="Write a reply..."
                minRows={1}
                maxRows={4}
                size="sm"
                variant="bordered"
                value={replyContent}
                onValueChange={setReplyContent}
                className="flex-1"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  color="primary"
                  isLoading={createComment.isPending}
                  isDisabled={!replyContent.trim()}
                  onPress={handleReply}
                  isIconOnly
                >
                  <Icon icon="solar:plain-bold" className="text-base" />
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => {
                    setReplyOpen(false);
                    setReplyContent("");
                  }}
                  isIconOnly
                >
                  <Icon icon="solar:close-circle-linear" className="text-base" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { user, loading: userLoading } = useGetIdentity();
  const { data: comments = [], isLoading } = usePostComments(postId);
  const createComment = useCreateComment();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createComment.mutate(
      { postId, content: newComment.trim() },
      {
        onSuccess: () => setNewComment(""),
      }
    );
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <Heading as="h2" size="2xl" className="mb-8">
            Comments
            {comments.length > 0 && (
              <Text as="span" size="lg" color="muted" weight="normal" className="ml-2">
                ({comments.length})
              </Text>
            )}
          </Heading>

          {/* Comment input */}
          {userLoading ? null : user ? (
            <div className="flex gap-3 mb-8">
              <Avatar
                src={user.image || undefined}
                name={user.name}
                size="sm"
                className="shrink-0 mt-1"
              />
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts..."
                  minRows={2}
                  maxRows={6}
                  variant="bordered"
                  value={newComment}
                  onValueChange={setNewComment}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    color="primary"
                    size="sm"
                    isLoading={createComment.isPending}
                    isDisabled={!newComment.trim()}
                    onPress={handleSubmit}
                    startContent={<Icon icon="solar:plain-bold" className="text-base" />}
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-4 rounded-xl bg-default-50 border border-default-200 text-center">
              <Text size="sm" color="muted">
                Sign in to leave a comment.
              </Text>
            </div>
          )}

          {/* Comments list */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" color="primary" label="Loading comments..." />
            </div>
          ) : comments.length === 0 ? (
            <StateMessage
              type="empty"
              title="No Comments Yet"
              message="Be the first to share your thoughts on this article."
              icon="solar:chat-round-line-bold"
            />
          ) : (
            <div className="divide-y divide-default-200">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={postId}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
