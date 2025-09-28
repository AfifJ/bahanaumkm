import MobileBottomNav from '@/components/mobile-bottom-nav';
import { NavbarNonSearch } from '@/components/ui/navbar-04/non-search';
import { useIsMobile } from '@/hooks/use-mobile';

export default ({ children, breadcrumbs, backLink, title, navbar = true, ...props }) => {
    const isMobile = useIsMobile();
    return (
        <div className="relative w-full">
            {navbar &&
                <NavbarNonSearch
                    backLink={backLink}
                    title={title}
                />
            }

            <main className={isMobile ? 'pb-16' : ''}>
                {children}
            </main>
            {isMobile && <MobileBottomNav />}
        </div>
    )
};
