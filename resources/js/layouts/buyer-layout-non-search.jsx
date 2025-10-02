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

            <main>
                {children}
            </main>
        </PersistentNavigationWrapper>
    )
};
