'use client';

import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';

import { Button } from '../button';
import { Input } from '../input';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList
} from '../navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../dropdown-menu';

import { SearchIcon, ShoppingCart, User, X } from 'lucide-react';

import { UserMenuContent } from '@/components/user-menu-content';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { HamburgerIcon } from './hamburger-icon';

// Default navigation links
const defaultNavigationLinks = [];

export const Navbar04 = forwardRef((
  {
    className,
    logo = <Logo />,
    navigationLinks = defaultNavigationLinks,
    signInText = 'Sign In',
    cartCount = "",
    menuItems,
    onSignInClick,
    onCartClick,
    onSearchSubmit,
    profileLink,
    ...props
  },
  ref
) => {
  const { auth } = usePage().props;
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const searchId = useId();
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setIsMobile(width < 768); // 768px is md breakpoint
      }
    };

    checkWidth();

    const resizeObserver = new ResizeObserver(checkWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    const params = new URLSearchParams(window.location.search);

    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Combine refs
  const combinedRef = useCallback((node) => {
    containerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
      setSearchQuery('');
    }
  }, [searchQuery, onSearchSubmit]);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
  }, []);

  const handleSearchClick = useCallback(() => {
    setShowSearch(true);
    setTimeout(() => searchRef.current?.focus(), 0);
  }, []);

  return (
    <header
      ref={combinedRef}
      className={cn(
        'sticky top-0 z-50 w-full bg-background px-4 md:px-6 [&_*]:no-underline border-b',
        className
      )}
      {...props}>
      <div
        className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        {showSearch &&
          <>
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
              <Input
                id={searchId}
                name="search"
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="peer h-8 ps-10 font-light text-sm pe-4 shadow-none border-0 bg-gray-50"
                placeholder="Cari Produk"
                type="search" />
              <div
                className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-4 peer-disabled:opacity-50">
                <SearchIcon size={16} />
              </div>
            </form>
            <Button variant={'outline'} onClick={toggleSearch}>
              <X />
            </Button>
          </>
        }
        {!showSearch &&
          <div className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 items-center gap-4 max-md:justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2 text-primary cursor-pointer">
                <div className='h-8'>
                  {logo}
                </div>
              </Link>
              {/* Navigation menu */}
              {!isMobile && (
                <NavigationMenu className="flex">
                  <NavigationMenuList className="gap-1">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index}>
                        <Link
                          href={link.href}
                          className="text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md hover:bg-accent"
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              )}
              <div className='flex gap-2'>
                <Button variant={'ghost'} onClick={handleSearchClick} className={'cursor-pointer'}>
                  <SearchIcon className='h-8 w-8' />
                </Button>
              </div>

            </div>
          </div>}
        {/* Right side */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            {auth.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <User size={16} />
                    {auth.user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <UserMenuContent profileLink={profileLink} menuItems={menuItems} user={auth.user} />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // User is not logged in - show sign in button
              onSignInClick ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    onSignInClick();
                  }}>
                  {signInText}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  asChild>
                  <Link href="/login">
                    {signInText}
                  </Link>
                </Button>
              )
            )}
            {auth?.user?.role_id === 5 &&
              <Button
                size="sm"
                className="text-sm font-medium px-4 h-9 hover:cursor-pointer rounded-md"
                onClick={(e) => {
                  e.preventDefault();
                  if (onCartClick) onCartClick();
                }}>
                <span className="flex items-baseline gap-2">
                  <ShoppingCart />
                  {cartCount > 0 &&
                    <span className="text-primary-foreground/60 text-xs">
                      {cartCount}
                    </span>
                  }
                </span>
              </Button>
            }

            {!auth?.user &&
              <Button
                size="sm"
                asChild
              >
                <Link
                  className="text-sm font-medium px-4 h-9 hover:cursor-pointer rounded-md"
                  href={'/login'}
                >
                  <span className="flex items-baseline gap-2">
                    <ShoppingCart />
                  </span>
                </Link>
              </Button>}

          </div>
        )}
      </div>
    </header >
  );
});

Navbar04.displayName = 'Navbar04';
