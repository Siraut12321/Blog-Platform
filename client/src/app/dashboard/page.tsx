'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Eye, Heart, TrendingUp, PenSquare, ArrowRight } from 'lucide-react';
import { Post } from '@/types';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/index';
import { Badge } from '@/components/ui/index';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/my-posts').then(({ data }) => {
      setPosts(data.data);
    }).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    totalViews: posts.reduce((acc, p) => acc + p.views, 0),
    totalLikes: posts.reduce((acc, p) => acc + p.likesCount, 0),
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your blog.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create"><PenSquare className="h-4 w-4 mr-2" /> New Post</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: stats.total, icon: FileText, color: 'text-blue-500' },
          { label: 'Published', value: stats.published, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-purple-500' },
          { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'text-red-500' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-3xl font-bold">{loading ? '—' : value.toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Posts</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/posts">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No posts yet. Start writing!</p>
              <Button asChild><Link href="/dashboard/create">Create your first post</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.slice(0, 5).map((post) => (
                <div key={post._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                      {post.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" />{post.views}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/edit/${post._id}`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
