'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Calendar, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  userName?: string;
  userEmail?: string;
  currentBrand?: {
    id: string;
    name: string;
    logo_url?: string | null;
  };
  brands?: Array<{
    id: string;
    name: string;
    logo_url?: string | null;
  }>;
}

export default function TopBar({ userName, userEmail, currentBrand, brands = [] }: TopBarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [selectedDate] = useState('Nov 14, 2025');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initials = userName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <header className="fixed left-16 right-0 top-0 z-30 h-16 border-b border-border bg-card">
      <div className="flex h-full items-center justify-between px-6">
        {/* Brand Selector */}
        <div className="flex items-center gap-4">
          {currentBrand && (
            <Select defaultValue={currentBrand.id}>
              <SelectTrigger className="w-[200px] border-none bg-transparent">
                <div className="flex items-center gap-2">
                  {currentBrand.logo_url ? (
                    <Image src={currentBrand.logo_url} alt="" width={24} height={24} className="h-6 w-6 rounded" />
                  ) : (
                    <div className="h-6 w-6 rounded bg-primary/20" />
                  )}
                  <SelectValue>{currentBrand.name}</SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    <div className="flex items-center gap-2">
                      {brand.logo_url ? (
                        <Image src={brand.logo_url} alt="" width={20} height={20} className="h-5 w-5 rounded" />
                      ) : (
                        <div className="h-5 w-5 rounded bg-primary/20" />
                      )}
                      {brand.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Date Picker */}
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{selectedDate}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* Get Help */}
          <Button variant="ghost" size="sm">
            Get Help
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-left sm:flex">
                  <span className="text-sm font-medium">{userName || 'User'}</span>
                  {currentBrand && (
                    <span className="text-xs text-muted-foreground">{currentBrand.name}</span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
