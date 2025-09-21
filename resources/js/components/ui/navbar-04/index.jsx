'use client';;
import * as React from 'react';
import { useEffect, useState, useRef, useId } from 'react';
import { SearchIcon, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../popover';
import { Button } from '../button';
import { Input } from '../input';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '../navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { cn } from '@/lib/utils';
import { usePage, Link, router } from '@inertiajs/react';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';

// Simple logo component for the navbar
const Logo = (props) => {
  return (
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 324 323'
      fill='currentColor'
      xmlns='http://www.w3.org/2000/svg'
      {...props}>
      <rect
        x='88.1023'
        y='144.792'
        width='151.802'
        height='36.5788'
        rx='18.2894'
        transform='rotate(-38.5799 88.1023 144.792)'
        fill='currentColor' />
      <rect
        x='85.3459'
        y='244.537'
        width='151.802'
        height='36.5788'
        rx='18.2894'
        transform='rotate(-38.5799 85.3459 244.537)'
        fill='currentColor' />
    </svg>
  );
};

// Hamburger icon component
const HamburgerIcon = ({
  className,
  ...props
}) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]" />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45" />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]" />
  </svg>
);

// Default navigation links
const defaultNavigationLinks = [
];

export const Navbar04 = React.forwardRef((
  {
    className,
    logo = <Logo />,
    logoHref = '#',
    navigationLinks = defaultNavigationLinks,
    signInText = 'Sign In',
    signInHref = '#signin',
    cartText = 'Cart',
    cartHref = '#cart',
    cartCount = "",
    searchPlaceholder = 'Search...',
    onSignInClick,
    onCartClick,
    onSearchSubmit,
    ...props
  },
  ref
) => {
  const { auth } = usePage().props;
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
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

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Combine refs
  const combinedRef = React.useCallback((node) => {
    containerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search');
    if (onSearchSubmit) {
      onSearchSubmit(query);
    }
  };

  return (
    <header
      ref={combinedRef}
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline',
        className
      )}
      {...props}>
      <div
        className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-2">
          {/* Mobile menu trigger */}
          {isMobile && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                  variant="ghost"
                  size="icon">
                  <HamburgerIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-fit p-1">
                <NavigationMenu className="max-w-none">
                  <NavigationMenuList className="flex-col items-start gap-1 p-1">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <Button
                          onClick={(e) => e.preventDefault()}
                          variant={"ghost"}
                        >
                          {link.label}
                        </Button>
                      </NavigationMenuItem>
                    ))}
                    <NavigationMenuItem className="w-full" role="presentation" aria-hidden={true}>
                      <div
                        role="separator"
                        aria-orientation="horizontal"
                        className="bg-border -mx-1 my-1 h-px" />
                    </NavigationMenuItem>
                    {auth.user ? (
                      // User is logged in - show user menu items
                      <>
                        <NavigationMenuItem className="w-full">
                          <button
                            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline">
                            <User size={16} className="mr-2" />
                            {auth.user.name}
                          </button>
                        </NavigationMenuItem>
                        {auth.user.role_id === 1 && (
                          <NavigationMenuItem className="w-full">
                            <Link
                              href={route('admin.dashboard')}
                              className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline">
                              <LayoutDashboard size={16} className="mr-2" />
                              Dashboard Admin
                            </Link>
                          </NavigationMenuItem>
                        )}
                        <NavigationMenuItem className="w-full">
                          <Link
                            href={route('profile.edit')}
                            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline">
                            <Settings size={16} className="mr-2" />
                            Profil
                          </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem className="w-full">
                          <Link
                            method="post"
                            href={route('logout')}
                            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer no-underline">
                            <LogOut size={16} className="mr-2" />
                            Logout
                          </Link>
                        </NavigationMenuItem>
                      </>
                    ) : (
                      // User is not logged in - show sign in button
                      <NavigationMenuItem className="w-full">
                        {onSignInClick ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              onSignInClick();
                            }}
                            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline">
                            {signInText}
                          </button>
                        ) : (
                          <Link
                            href={route('login')}
                            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline">
                            {signInText}
                          </Link>
                        )}
                      </NavigationMenuItem>
                    )}
                    <NavigationMenuItem className="w-full">
                      <Button
                        size="sm"
                        className="mt-0.5 w-full text-left text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onCartClick) onCartClick();
                        }}>
                        <span className="flex items-baseline gap-2">
                          {cartText}
                          <span className="text-primary-foreground/60 text-xs">
                            {cartCount}
                          </span>
                        </span>
                      </Button>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          )}
          {/* Main nav */}
          <div className="flex flex-1 items-center gap-4 max-md:justify-between">
            <button
              onClick={(e) => e.preventDefault()}
              className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer">
              <div className="text-2xl">
                {logo}
              </div>
              <span className="hidden font-bold text-xl sm:inline-block">BahanaUMKM</span>
            </button>
            {/* Navigation menu */}
            {!isMobile && (
              <NavigationMenu className="flex">
                <NavigationMenuList className="gap-1">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink
                        href={link.href}
                        onClick={(e) => e.preventDefault()}
                        className="hover:bg-transparent"
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
              <Input
                id={searchId}
                name="search"
                className="peer h-8 ps-8 pe-2"
                placeholder={searchPlaceholder}
                type="search" />
              <div
                className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
                <SearchIcon size={16} />
              </div>
            </form>
          </div>
        </div>
        {/* Right side */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            {auth.user ? (
              // User is logged in - show user dropdown
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
                  <UserMenuContent user={auth.user} />
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
                  <Link href={route('login')}>
                    {signInText}
                  </Link>
                </Button>
              )
            )}
            <Button
              size="sm"
              className="text-sm font-medium px-4 h-9 rounded-md shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                if (onCartClick) onCartClick();
              }}>
              <span className="flex items-baseline gap-2">
                {cartText}
                <span className="text-primary-foreground/60 text-xs">
                  {cartCount}
                </span>
              </span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
});

Navbar04.displayName = 'Navbar04';

export { Logo, HamburgerIcon };
