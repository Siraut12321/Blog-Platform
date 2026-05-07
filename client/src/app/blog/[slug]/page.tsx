'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Eye, Clock, Share2, ArrowLeft } from 'lucide-react';
import { Post } from '@/types';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge, Avatar, AvatarFallback, AvatarImage, Skeleton } from '@/components/ui/index';
import CommentSection from '@/components/blog/CommentSection';
import { formatDate } from '@/lib/utils';

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${slug}`);
        setPost(data.data);
        setLikesCount(data.data.likesCount);
        if (user) {
          setLiked(data.data.likes.includes(user._id));
          setBookmarked(user.bookmarks?.includes(data.data._id));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, user]);

  const handleLike = async () => {
    if (!user) return toast({ title: 'Please login to like posts', variant: 'destructive' });
    try {
      const { data } = await api.post(`/posts/${post!._id}/like`);
      setLiked(data.data.liked);
      setLikesCount(data.data.likesCount);
    } catch {
      toast({ title: 'Failed to update like', variant: 'destructive' });
    }
  };

  const handleBookmark = async () => {
    if (!user) return toast({ title: 'Please login to bookmark posts', variant: 'destructive' });
    try {
      const { data } = await api.post(`/posts/${post!._id}/bookmark`);
      setBookmarked(data.data.bookmarked);
      toast({ title: data.data.bookmarked ? 'Bookmarked!' : 'Removed bookmark', variant: 'success' });
    } catch {
      toast({ title: 'Failed to update bookmark', variant: 'destructive' });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied to clipboard!', variant: 'success' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        <Skeleton className="aspect-video w-full rounded-2xl mb-8" />
        <div className="space-y-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Button asChild><Link href="/blog">Back to Blog</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2">
        <Link href="/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Blog</Link>
      </Button>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/blog?tag=${tag}`}>
              <Badge variant="secondary" className="capitalize hover:bg-primary/10 transition-colors cursor-pointer">{tag}</Badge>
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">{post.title}</h1>

        {/* Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-8 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarImage src={post.author?.avatar} />
              <AvatarFallback>{post.author?.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author?.name}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDate(post.createdAt)}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readingTime} min read</span>
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.views}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={liked ? 'text-red-500 hover:text-red-600' : ''}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleBookmark} className={bookmarked ? 'text-primary' : ''}>
              <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            {user?._id === post.author._id && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/dashboard/edit/${post._id}`}>Edit</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author Bio */}
        {post.author?.bio && (
          <div className="border rounded-2xl p-6 mb-12 bg-muted/30">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="text-lg">{post.author.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg mb-1">{post.author.name}</p>
                <p className="text-muted-foreground text-sm">{post.author.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentSection postId={post._id} />
      </motion.article>
    </div>
  );
}
