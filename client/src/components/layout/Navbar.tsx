'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Moon, Sun, PenSquare, Search, BookOpen, Menu, X, Bookmark, LayoutDashboard, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/index';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/search', label: 'Search' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>Inkwell</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button variant="ghost" size="icon" asChild className="hidden md:flex">
            <Link href="/search"><Search className="h-4 w-4" /></Link>
          </Button>

          {user ? (
            <>
              {user.role === 'author' && (
                <Button size="sm" asChild className="hidden md:flex gap-1">
                  <Link href="/dashboard/create"><PenSquare className="h-4 w-4" /> Write</Link>
                </Button>
              )}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="z-50 min-w-[180px] rounded-xl border bg-popover p-1 shadow-lg" sideOffset={8} align="end">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    {user.role === 'author' && (
                      <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent" onSelect={() => router.push('/dashboard')}>
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent" onSelect={() => router.push('/bookmarks')}>
                      <Bookmark className="h-4 w-4" /> Bookmarks
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="my-1 border-t" />
                    <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-destructive/10 text-destructive" onSelect={logout}>
                      <LogOut className="h-4 w-4" /> Logout
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild><Link href="/login">Login</Link></Button>
              <Button size="sm" asChild><Link href="/register">Get Started</Link></Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t bg-background px-4 py-4 space-y-3"
        >
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>
              {label}
            </Link>
          ))}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1"><Link href="/login">Login</Link></Button>
              <Button size="sm" asChild className="flex-1"><Link href="/register">Register</Link></Button>
            </div>
          )}
        </motion.div>
      )}
    </header>
  );
}
