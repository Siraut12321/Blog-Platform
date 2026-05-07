'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Heart, Edit, Trash2, Plus, Clock } from 'lucide-react';
import { Post } from '@/types';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent } from '@/components/ui/index';
import { formatDate } from '@/lib/utils';

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    api.get('/posts/my-posts').then(({ data }) => setPosts(data.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast({ title: 'Post deleted', variant: 'success' });
    } catch {
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Posts</h1>
        <Button asChild size="sm">
          <Link href="/dashboard/create"><Plus className="h-4 w-4 mr-1" /> New Post</Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'published', 'draft'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {f} ({f === 'all' ? posts.length : posts.filter((p) => p.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No posts found.</p>
          <Button asChild><Link href="/dashboard/create">Create your first post</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => (
            <motion.div key={post._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                          {post.status}
                        </Badge>
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs capitalize">{tag}</Badge>
                        ))}
                      </div>
                      <h3 className="font-semibold truncate">{post.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{formatDate(post.createdAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readingTime}m</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.likesCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {post.status === 'published' && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/blog/${post.slug}`}>View</Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/edit/${post._id}`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post._id)} className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
