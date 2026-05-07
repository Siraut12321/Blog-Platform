'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Trash2, CornerDownRight } from 'lucide-react';
import { Comment } from '@/types';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/index';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/index';
import { timeAgo } from '@/lib/utils';

interface CommentSectionProps {
  postId: string;
}

function CommentItem({ comment, postId, onDelete, onReply }: {
  comment: Comment; postId: string; onDelete: (id: string) => void; onReply: (parentId: string, content: string) => Promise<void>;
}) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment._id, replyText);
    setReplyText('');
    setShowReply(false);
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback className="text-xs">{comment.author.name[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 px-2">
            {user && (
              <button onClick={() => setShowReply(!showReply)} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                <CornerDownRight className="h-3 w-3" /> Reply
              </button>
            )}
            {user?._id === comment.author._id && (
              <button onClick={() => onDelete(comment._id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>
          {showReply && (
            <div className="mt-2 flex gap-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] text-sm"
              />
              <Button size="sm" onClick={handleReply} disabled={submitting || !replyText.trim()}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
          {comment.replies.map((reply) => (
            <div key={reply._id} className="flex gap-3">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={reply.author.avatar} />
                <AvatarFallback className="text-xs">{reply.author.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted/50 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{reply.author.name}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
                {user?._id === reply.author._id && (
                  <button onClick={() => onDelete(reply._id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 mt-1 px-2">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/comments/${postId}`);
        setComments(data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/comments/${postId}`, { content: newComment });
      setComments((prev) => [data.data, ...prev]);
      setNewComment('');
      toast({ title: 'Comment added!', variant: 'success' });
    } catch {
      toast({ title: 'Failed to add comment', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const { data } = await api.post(`/comments/${postId}`, { content, parentComment: parentId });
      setComments((prev) =>
        prev.map((c) => c._id === parentId ? { ...c, replies: [...(c.replies || []), data.data] } : c)
      );
      toast({ title: 'Reply added!', variant: 'success' });
    } catch {
      toast({ title: 'Failed to add reply', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id).map((c) => ({
        ...c, replies: c.replies?.filter((r) => r._id !== id) || [],
      })));
      toast({ title: 'Comment deleted', variant: 'success' });
    } catch {
      toast({ title: 'Failed to delete comment', variant: 'destructive' });
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </h2>

      {user ? (
        <div className="flex gap-3 mb-8">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[80px]"
            />
            <Button onClick={handleSubmit} disabled={submitting || !newComment.trim()} size="sm">
              <Send className="h-4 w-4 mr-1" /> Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6 p-4 rounded-xl border bg-muted/30">
          <a href="/login" className="text-primary hover:underline">Sign in</a> to join the conversation.
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-16 rounded-xl bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-6">
            {comments.map((comment) => (
              <motion.div key={comment._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <CommentItem comment={comment} postId={postId} onDelete={handleDelete} onReply={handleReply} />
              </motion.div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No comments yet. Be the first!</p>
            )}
          </div>
        </AnimatePresence>
      )}
    </section>
  );
}
