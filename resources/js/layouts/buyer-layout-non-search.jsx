import { NavbarNonSearch } from '@/components/ui/navbar-04/non-search';
import PersistentNavigationWrapper from '@/components/persistent-navigation-wrapper';

export default ({ withBottomNav, children, breadcrumbs, backLink, title, navbar = true, ...props }) => {
    return (
        <PersistentNavigationWrapper withBottomNav={withBottomNav}>
            {navbar &&
                <NavbarNonSearch
                    backLink={backLink}
                    title={title}
                />
            }

            <main className="w-full">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </PersistentNavigationWrapper>
    )
};
