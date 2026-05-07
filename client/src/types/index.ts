export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'author' | 'reader';
  avatar?: string;
  bio?: string;
  bookmarks: string[];
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'published';
  author: Pick<User, '_id' | 'name' | 'avatar' | 'bio'>;
  views: number;
  readingTime: number;
  likes: string[];
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: Pick<User, '_id' | 'name' | 'avatar'>;
  content: string;
  parentComment?: string | null;
  likes: string[];
  replies?: Comment[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  pages: number;
}
