import { NavbarNonSearch } from '@/components/ui/navbar-04/non-search';
import PersistentNavigationWrapper from '@/components/persistent-navigation-wrapper';

export default ({ children, breadcrumbs, backLink, title, navbar = true, ...props }) => {
    return (
        <PersistentNavigationWrapper>
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
