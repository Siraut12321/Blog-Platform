'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { Post } from '@/types';
import api from '@/lib/api';
import PostCard from '@/components/blog/PostCard';
import PostCardSkeleton from '@/components/blog/PostCardSkeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 max-w-4xl"><p className="text-muted-foreground">Loading...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get(`/posts?search=${encodeURIComponent(q)}&limit=20`);
      setPosts(data.data.posts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); handleSearch(q); }
  }, [searchParams, handleSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Search</h1>

      <form onSubmit={onSubmit} className="flex gap-3 mb-10">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, topics, tags..."
            className="pl-10 h-12 text-base"
            autoFocus
          />
        </div>
        <Button type="submit" size="lg">Search</Button>
      </form>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : searched ? (
        posts.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">{posts.length} result{posts.length !== 1 ? 's' : ''} for &quot;{query}&quot;</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No results found</p>
            <p className="text-muted-foreground">Try different keywords or browse all posts.</p>
          </div>
        )
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Start typing to search for articles</p>
        </div>
      )}
    </div>
  );
}
