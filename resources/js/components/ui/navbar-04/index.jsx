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

import SearchDropdown from '@/components/search-dropdown';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { HamburgerIcon } from './hamburger-icon';
import { UserMenuContent } from '@/components/user-menu-content';

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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const searchId = useId();

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

  const handleSearchSubmit = useCallback((query) => {
    if (query.trim() && onSearchSubmit) {
      onSearchSubmit(query.trim());
      setSearchQuery('');
      setIsSearchExpanded(false);
      setIsSearchDropdownOpen(false);
    }
  }, [onSearchSubmit]);

  const handleSearchExpand = useCallback(() => {
    setIsSearchExpanded(true);
    setIsSearchDropdownOpen(true);
    setTimeout(() => searchRef.current?.focus(), 100);
  }, []);

  const handleSearchCollapse = useCallback(() => {
    setIsSearchExpanded(false);
    setIsSearchDropdownOpen(false);
    setSearchQuery('');
  }, []);

  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearchDropdownOpen(value.length >= 0);
  }, []);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleSearchCollapse();
    }
  }, [handleSearchCollapse]);

  const handleDropdownClose = useCallback(() => {
    setIsSearchDropdownOpen(false);
    // Tidak collapse search bar, hanya tutup dropdown
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
        {isMobile ? (
          // Mobile Layout
          <>
            {!isSearchExpanded && onSearchSubmit ? (
              // State OFF: Logo + Search + Cart (only if search is enabled)
              <>
                {/* Mobile Left Side - Logo */}
                <div className="flex items-center">
                  <Link
                    href="/"
                    className="flex items-center space-x-2 text-primary cursor-pointer">
                    <div className='h-8'>
                      {logo}
                    </div>
                  </Link>
                </div>

                {/* Mobile Right Side - Search + Cart */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearchExpand}
                    className="p-2 h-10 w-10"
                  >
                    <SearchIcon className="h-5 w-5" />
                  </Button>
                  {auth?.user?.role_id == 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onCartClick) onCartClick();
                      }}
                      className="relative p-2 h-10 w-10"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </>
            ) : !onSearchSubmit ? (
              // Mobile Layout without search functionality (for sales)
              <>
                {/* Mobile Left Side - Logo */}
                <div className="flex items-center">
                  <Link
                    href="/"
                    className="flex items-center space-x-2 text-primary cursor-pointer">
                    <div className='h-8'>
                      {logo}
                    </div>
                  </Link>
                </div>

                {/* Mobile Right Side - Cart only */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  {auth?.user?.role_id == 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onCartClick) onCartClick();
                      }}
                      className="relative p-2 h-10 w-10"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              // State ON: Full Search Bar (no logo)
              <div className="flex-1 relative">
                <Input
                  id={searchId}
                  name="search"
                  ref={searchRef}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pr-10 h-10"
                  placeholder="Cari produk, kategori, atau merek..."
                  type="search"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSearchCollapse}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Search Dropdown */}
                <SearchDropdown
                  isOpen={isSearchDropdownOpen}
                  onClose={handleDropdownClose}
                  onSelect={handleSearchSubmit}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSearchSubmit={handleSearchSubmit}
                />
              </div>
            )}
          </>
        ) : (
          // Desktop Layout (tetap sama)
          <>
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center space-x-2 text-primary cursor-pointer">
                <div className='h-8'>
                  {logo}
                </div>
              </Link>
              {/* Navigation menu */}
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
            </div>

            {/* Center - Search Bar (only if onSearchSubmit is provided) */}
            {onSearchSubmit && (
            <div className="flex-1 max-w-lg mx-6">
              <div className={cn(
                "search-input-container relative transition-all duration-300 ease-in-out w-full"
              )}>
                <div className="relative">
                  <SearchIcon
                    className={cn(
                      "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors",
                      isSearchExpanded ? "h-5 w-5" : "h-4 w-4"
                    )}
                  />
                  <Input
                    id={searchId}
                    name="search"
                    ref={searchRef}
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={handleSearchExpand}
                    onClick={handleSearchExpand}
                    className={cn(
                      "w-full pl-10 pr-10 transition-all duration-300 ease-in-out",
                      "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20",
                      isSearchExpanded
                        ? "h-10 text-base bg-white shadow-sm"
                        : "h-9 text-sm bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    )}
                    placeholder={isSearchExpanded ? "Cari produk, kategori, atau merek..." : "Cari..."}
                    type="search"
                  />
                  {(searchQuery || isSearchExpanded) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSearchCollapse}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Search Dropdown */}
                <SearchDropdown
                  isOpen={isSearchDropdownOpen}
                  onClose={handleDropdownClose}
                  onSelect={handleSearchSubmit}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSearchSubmit={handleSearchSubmit}
                />
              </div>
            </div>
            )}

            {/* Right side - User Actions */}
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
              {auth?.user?.role_id == 5 &&
                <Button
                  size="sm"
                  variant={'outline'}
                  className="text-sm font-medium px-4 h-9 hover:cursor-pointer rounded-md relative"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onCartClick) onCartClick();
                  }}>
                  <span className="flex items-center gap-2">
                    <ShoppingCart />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {cartCount}
                      </span>
                    )}
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
          </>
        )}
      </div>
    </header>
  );
});

Navbar04.displayName = 'Navbar04';
