import { Suspense } from 'react';
import BlogClient from './BlogClient';

export const metadata = { title: 'All Stories' };

export default function BlogPage() {
  return (
    <Suspense>
      <BlogClient />
    </Suspense>
  );
}
