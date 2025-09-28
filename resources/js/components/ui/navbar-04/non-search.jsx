'use client';;
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '../button';
import { ChevronLeft } from 'lucide-react';

export const NavbarNonSearch = React.forwardRef((
  {
    className,
    cartText = 'Cart',
    cartHref = '#cart',
    cartCount = "",
    onCartClick,
    backLink = "",
    title = "Title",
    ...props
  },
  ref
) => {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

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
        <div className="flex flex-1 items-center gap-2">
          <div className="flex flex-1 items-center gap-4 max-md:justify-between">
            <div className='w-full flex items-center relative'>
              {backLink &&
                <Button asChild className={'absolute top-1/2 -translate-y-1/2'} variant={'outline'}>
                  <Link href={backLink} >
                    <ChevronLeft />
                  </Link>
                </Button>
              }
              <h1 className='text-xl mx-auto font-bold'>
                {title}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

NavbarNonSearch.displayName = 'NavbarNonSearch';

