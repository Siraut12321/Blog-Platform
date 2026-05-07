import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, TrendingUp, Sparkles, Clock, Eye } from 'lucide-react';
import { Post } from '@/types';
import PostCard from '@/components/blog/PostCard';
import { Button } from '@/components/ui/button';
import { Badge, Avatar, AvatarFallback, AvatarImage } from '@/components/ui/index';
import { formatDate } from '@/lib/utils';

async function getData() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const [postsRes, trendingRes] = await Promise.all([
      fetch(`${base}/posts?limit=9`, { next: { revalidate: 60 } }),
      fetch(`${base}/posts/trending`, { next: { revalidate: 60 } }),
    ]);
    const posts = postsRes.ok ? (await postsRes.json()).data.posts : [];
    const trending = trendingRes.ok ? (await trendingRes.json()).data : [];
    return { posts, trending };
  } catch {
    return { posts: [], trending: [] };
  }
}

export default async function HomePage() {
  const { posts, trending } = await getData();
  const featuredPost: Post = posts[0];
  const recentPosts: Post[] = posts.slice(1, 5);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero */}
      <section className="text-center py-16 mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" /> The home for curious minds
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          Ideas worth<br />reading
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Discover stories, thinking, and expertise from writers on any topic that matters to you.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button size="lg" asChild>
            <Link href="/blog">Start Reading <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register">Start Writing</Link>
          </Button>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="mb-12">
          <Link href={`/blog/${featuredPost.slug}`} className="group block rounded-2xl border bg-card overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="grid md:grid-cols-2 gap-0">
              {featuredPost.coverImage && (
                <div className="relative aspect-video md:aspect-auto overflow-hidden">
                  <Image src={featuredPost.coverImage} alt={featuredPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-8 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-4">
                  {featuredPost.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <h2 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={featuredPost.author?.avatar} />
                      <AvatarFallback>{featuredPost.author?.name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{featuredPost.author?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(featuredPost.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{featuredPost.readingTime}m</span>
                    <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{featuredPost.views}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Stories</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog">View all <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {recentPosts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
          </div>
        </div>

        {/* Trending Sidebar */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Trending</h2>
          </div>
          <div className="space-y-4">
            {trending.map((post: Post, i: number) => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="flex gap-4 group">
                <span className="text-3xl font-bold text-muted-foreground/30 leading-none w-8 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post.author?.name}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
