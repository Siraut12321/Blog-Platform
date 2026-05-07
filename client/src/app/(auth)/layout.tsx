import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <BookOpen className="h-7 w-7 text-primary" />
            Inkwell
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
