'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, FileDown, House, LogOut, ShieldCheck } from 'lucide-react';
import { OrmLogo } from '@/components/ui/OrmLogo';
import { useLogoutMutation } from '@/features/auth/hooks/use-logout-mutation';
import type { SessionUser } from '@/types/auth';

export interface HeaderProps {
  user: SessionUser | null;
}

const PUBLIC_PATHS = ['/login'];

const NAV_LINKS = [
  { href: '/home', label: 'Início', icon: House },
  { href: '/metrics', label: 'Relatórios', icon: FileDown },
];

const ADMIN_NAV_LINK = { href: '/admin', label: 'Administração', icon: ShieldCheck };

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const logoutMutation = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPublicRoute = useMemo(() => PUBLIC_PATHS.includes(pathname), [pathname]);
  const showProfileMenu = Boolean(user) && !isPublicRoute;
  const navLinks = useMemo(() => (user?.role === 'admin' ? [...NAV_LINKS, ADMIN_NAV_LINK] : NAV_LINKS), [user?.role]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full z-50 md:px-20 px-5 py-5 bg-transparent text-foreground">
      <div className="border-b border-border pb-[18px] flex items-center justify-between w-full">
        <Link href="/home" className="flex items-center cursor-pointer select-none">
          <OrmLogo height={36} />
        </Link>

        {showProfileMenu && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 hover:bg-surface-soft px-3 py-2 rounded-lg transition"
              onClick={() => setMenuOpen((open) => !open)}
              title="Notificações"
              aria-label="Notificações"
            >
              <Bell />
              <div className="flex flex-col items-start ml-6 text-left">
                <span className="text-sm font-medium text-foreground">{user?.name}</span>
                <span className="text-xs text-accent">{user?.companyName}</span>
              </div>
              <ChevronDown size={18} className={menuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg py-3 z-[999]">
                <div className="px-4 pb-2 border-b border-border">
                  <p className="text-sm text-muted">{user?.email}</p>
                </div>

                <div className="flex flex-col py-2">
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className="flex items-center gap-2 px-4 py-2 hover:bg-surface-soft transition text-foreground">
                      <Icon size={16} /> {label}
                    </Link>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logoutMutation.mutate();
                  }}
                  className="flex items-center gap-2 px-4 py-2 mt-2 text-danger hover:bg-danger-soft transition w-full text-left border-t border-border"
                >
                  <LogOut size={16} /> Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
