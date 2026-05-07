'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Post } from '@/types';
import api from '@/lib/api';
import PostEditor from '@/components/blog/PostEditor';
import { Skeleton } from '@/components/ui/index';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch by ID from my-posts
    api.get('/posts/my-posts').then(({ data }) => {
      const found = data.data.find((p: Post) => p._id === id);
      setPost(found || null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!post) return <p className="text-muted-foreground">Post not found.</p>;

  return <PostEditor post={post} mode="edit" />;
}
