'use client';;
import { useEffect, useState, useRef, useId, forwardRef, useCallback } from 'react';
import { User, LogOut, Settings, LayoutDashboard, SearchIcon, ShoppingCart, Search, BaggageClaim, X } from 'lucide-react';
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

export const Navbar04 = forwardRef((
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
    menuItems,
    categories = [],
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
      setSearchQuery(''); // Clear search after submit
    }
  };

  return (
    <header
      ref={combinedRef}
      className={cn(
        'sticky top-0 z-50 w-full bg-background px-4 md:px-6 [&_*]:no-underline',
        className
      )}
      {...props}>
      <div
        className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        {/* Left side */}
        {/* Search form */}
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
            <Button variant={'outline'} onClick={() => setShowSearch(false)}>
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
                {/* <div className="text-2xl">
                {logo}
              </div> */}
                <span className="font-bold text-xl sm:inline-block">Bahana</span>
              </Link>
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
              <div className='flex gap-2'>
                <Button variant={'ghost'} onClick={() => { setShowSearch(true); searchRef.current.focus() }} className={'cursor-pointer'}>
                  <Search className='h-8 w-8' />
                </Button>
                {/* <Button className={'cursor-pointer'}>
                  <ShoppingCart className='h-8 w-8' />
                  Keranjang
                </Button> */}
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
                  <Link href={route('login')}>
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
                  {/* {cartText} */}
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

export { Logo, HamburgerIcon };
