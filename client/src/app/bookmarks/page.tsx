'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { Post } from '@/types';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import PostCard from '@/components/blog/PostCard';
import PostCardSkeleton from '@/components/blog/PostCardSkeleton';

export default function BookmarksPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      api.get('/posts/bookmarks').then(({ data }) => setPosts(data.data)).finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Bookmarks</h1>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No bookmarks yet. Save posts you want to read later.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
        </div>
      )}
    </div>
  );
}
