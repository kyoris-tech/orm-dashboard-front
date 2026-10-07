'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { BookOpen, Bell, ChevronDown, FileDown, House, LogOut, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { OrmLogo } from '@/components/ui/OrmLogo';
import { useLogoutMutation } from '@/features/auth/hooks/use-logout-mutation';
import { ImportToggle } from '@/features/resumes/components/ImportToggle';
import { AdminToggle } from '@/features/admin/components/AdminToggle';
import { cn } from '@/lib/utils/cn';
import type { SessionUser } from '@/types/auth';

export interface HeaderProps {
  user: SessionUser | null;
}

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const PUBLIC_PATHS = ['/login'];

const BASE_NAV_LINKS: NavLink[] = [
  { href: '/home', label: 'Início', icon: House },
  { href: '/metrics', label: 'Relatórios', icon: FileDown },
];

const ADMIN_NAV_LINK: NavLink = { href: '/admin', label: 'Administração', icon: ShieldCheck };

const MANUAL_NAV_LINK: NavLink = { href: '/manual', label: 'Manual', icon: BookOpen };

const MENU_ITEM_CLASSES = 'flex items-center gap-2 px-4 py-2 hover:bg-surface-soft transition';

function SectionToggle({ pathname, leading, joinedBelow }: { pathname: string; leading: React.ReactNode; joinedBelow: boolean }) {
  if (pathname === '/home') {
    return <ImportToggle leading={leading} joinedBelow={joinedBelow} />;
  }

  if (pathname === '/admin') {
    return <AdminToggle leading={leading} joinedBelow={joinedBelow} />;
  }

  return <>{leading}</>;
}

interface NavLinkListProps {
  navLinks: NavLink[];
  currentHref?: string;
  onNavigate: () => void;
}

function NavLinkList({ navLinks, currentHref, onNavigate }: NavLinkListProps) {
  return (
    <div className="flex flex-col py-2">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isCurrent = currentHref === href;

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(MENU_ITEM_CLASSES, isCurrent ? 'bg-surface-soft text-accent font-semibold' : 'text-foreground')}
          >
            <Icon size={16} /> {label}
          </Link>
        );
      })}
    </div>
  );
}

interface PageMenuProps {
  navLinks: NavLink[];
  currentPage: NavLink;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

function PageMenu({ navLinks, currentPage, isOpen, onToggle, onClose, menuRef }: PageMenuProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, inPill: false });
  const CurrentIcon = currentPage.icon;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.addEventListener('resize', onClose);
    window.addEventListener('scroll', onClose, true);

    return () => {
      window.removeEventListener('resize', onClose);
      window.removeEventListener('scroll', onClose, true);
    };
  }, [isOpen, onClose]);

  function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget.getBoundingClientRect();
    const pill = event.currentTarget.closest('[data-pill]')?.getBoundingClientRect();
    setPosition(
      pill
        ? { top: pill.bottom, left: pill.left, inPill: true }
        : { top: button.bottom, left: button.left, inPill: false },
    );
    onToggle();
  }

  return (
    <div className="shrink-0" ref={menuRef}>
      <button
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Trocar de página"
        className={cn(
          'flex items-center gap-2 bg-accent text-white hover:bg-accent-dark transition pl-4 pr-3 py-1.5 rounded-r-xl text-sm font-semibold whitespace-nowrap',
          isOpen && !position.inPill ? 'rounded-tl-2xl' : 'rounded-l-2xl',
        )}
      >
        <CurrentIcon size={16} />
        {currentPage.label}
        <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen &&
        createPortal(
          <div
            data-page-menu
            style={{ top: position.top, left: position.left }}
            className={cn(
              'fixed w-44 bg-surface border-2 border-t-0 rounded-b-2xl overflow-hidden shadow-lg z-[1000] animate-menu-drop',
              position.inPill ? 'border-border pt-1' : 'border-accent rounded-tr-xl',
            )}
          >
            <NavLinkList navLinks={navLinks} currentHref={currentPage.href} onNavigate={onClose} />
          </div>,
          document.body,
        )}
    </div>
  );
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const logoutMutation = useLogoutMutation();
  const [openMenu, setOpenMenu] = useState<'page' | 'profile' | null>(null);
  const pageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isPublicRoute = useMemo(() => PUBLIC_PATHS.includes(pathname), [pathname]);
  const showProfileMenu = Boolean(user) && !isPublicRoute;
  const navLinks = useMemo(
    () =>
      user?.role === 'admin'
        ? [...BASE_NAV_LINKS, ADMIN_NAV_LINK, MANUAL_NAV_LINK]
        : [...BASE_NAV_LINKS, MANUAL_NAV_LINK],
    [user?.role],
  );

  const currentPage = navLinks.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInside =
        pageMenuRef.current?.contains(target) ||
        profileMenuRef.current?.contains(target) ||
        (target instanceof Element && target.closest('[data-page-menu]'));

      if (!isInside) {
        setOpenMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closePageMenu = useCallback(() => {
    setOpenMenu((current) => (current === 'page' ? null : current));
  }, []);

  function toggleMenu(menu: 'page' | 'profile') {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  if (pathname === '/') {
    return null;
  }

  return (
    <header className="w-full z-50 md:px-20 px-5 py-5 bg-transparent text-foreground">
      <div className="border-b border-border pb-[18px] flex flex-wrap items-center justify-between gap-y-4 w-full">
        <Link href="/home" className="flex items-center cursor-pointer select-none order-1">
          <OrmLogo height={36} />
        </Link>

        {showProfileMenu && currentPage && (
          <div className="order-3 xl:order-2 w-full xl:w-auto flex justify-center">
            <div className="min-w-0 max-w-full overflow-x-auto">
              <Suspense fallback={null}>
                <SectionToggle
                  pathname={pathname}
                  joinedBelow={openMenu === 'page'}
                  leading={
                    <PageMenu
                      navLinks={navLinks}
                      currentPage={currentPage}
                      isOpen={openMenu === 'page'}
                      onToggle={() => toggleMenu('page')}
                      onClose={closePageMenu}
                      menuRef={pageMenuRef}
                    />
                  }
                />
              </Suspense>
            </div>
          </div>
        )}

        {showProfileMenu && (
          <div className="relative order-2 xl:order-3" ref={profileMenuRef}>
            <button
              className="flex items-center gap-2 hover:bg-surface-soft px-3 py-2 rounded-lg transition"
              onClick={() => toggleMenu('profile')}
              title="Notificações"
              aria-label="Notificações"
            >
              <Bell />
              <div className="flex flex-col items-start ml-6 text-left">
                <span className="text-sm font-medium text-foreground">{user?.name}</span>
                <span className="text-xs text-accent">{user?.companyName}</span>
              </div>
              <ChevronDown size={18} className={cn('transition-transform', openMenu === 'profile' && 'rotate-180')} />
            </button>

            {openMenu === 'profile' && (
              <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg py-3 z-[999]">
                <div className="px-4 pb-2 border-b border-border">
                  <p className="text-sm text-muted">{user?.email}</p>
                </div>

                <NavLinkList navLinks={navLinks} currentHref={currentPage?.href} onNavigate={() => setOpenMenu(null)} />

                <button
                  onClick={() => {
                    setOpenMenu(null);
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
