import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, Clock } from 'lucide-react';
import { Post } from '@/types';
import { formatDate } from '@/lib/utils';
import { Badge, Avatar, AvatarFallback, AvatarImage } from '@/components/ui/index';

interface PostCardProps {
  post: Post;
  index?: number;
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  return (
    <article
      className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {post.coverImage && (
        <Link href={`/blog/${post.slug}`} className="overflow-hidden aspect-video relative">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      )}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h2 className="font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={post.author?.avatar} />
              <AvatarFallback className="text-xs">{post.author?.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium">{post.author?.name}</p>
              <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3" />{post.readingTime}m</span>
            <span className="flex items-center gap-1 text-xs"><Heart className="h-3 w-3" />{post.likesCount}</span>
            <span className="flex items-center gap-1 text-xs"><Eye className="h-3 w-3" />{post.views}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
