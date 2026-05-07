import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Inkwell</span>
        </Link>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Inkwell. All rights reserved.</p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <Link href="/search" className="hover:text-primary transition-colors">Search</Link>
        </div>
      </div>
    </footer>
  );
}
