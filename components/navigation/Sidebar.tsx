'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, FileText, Tag, Search, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: BarChart3, label: 'Overview', href: '/overview' },
  { icon: FileText, label: 'Prompts', href: '/prompts' },
  { icon: Tag, label: 'Topics', href: '/topics' },
  { icon: Search, label: 'Keywords', href: '/keywords' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-border">
          <Link href="/dashboard" className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>

        {/* Help */}
        <div className="border-t border-border p-2">
          <button
            className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Get Help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
