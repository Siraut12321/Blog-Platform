'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { Post } from '@/types';
import api from '@/lib/api';
import PostCard from '@/components/blog/PostCard';
import PostCardSkeleton from '@/components/blog/PostCardSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/index';

const POPULAR_TAGS = ['technology', 'programming', 'design', 'startup', 'productivity', 'ai', 'web', 'career'];

export default function BlogClient() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '');

  const fetchPosts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '9' });
      if (search) params.set('search', search);
      if (activeTag) params.set('tag', activeTag);
      const { data } = await api.get(`/posts?${params}`);
      setPosts(data.data.posts);
      setTotal(data.data.total);
      setPages(data.data.pages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [search, activeTag]);

  useEffect(() => { fetchPosts(1); }, [activeTag]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">All Stories</h1>
        <p className="text-muted-foreground">{total} articles published</p>
      </div>

      <div className="mb-8 space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchPosts(1); }} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." className="pl-9" />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {POPULAR_TAGS.map((tag) => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? '' : tag)}>
              <Badge variant={activeTag === tag ? 'default' : 'outline'} className="cursor-pointer hover:bg-primary/10 transition-colors capitalize">
                {tag}
              </Badge>
            </button>
          ))}
          {activeTag && <Button variant="ghost" size="sm" onClick={() => setActiveTag('')}>Clear filter</Button>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading
          ? Array(9).fill(0).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)
        }
      </div>

      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No posts found.</p>
          <Button variant="ghost" className="mt-4" onClick={() => { setSearch(''); setActiveTag(''); }}>Clear filters</Button>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => fetchPosts(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          <Button variant="outline" disabled={page === pages} onClick={() => fetchPosts(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
