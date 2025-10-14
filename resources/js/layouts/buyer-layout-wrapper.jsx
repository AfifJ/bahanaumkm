import BuyerLayout from './buyer-layout';
import BuyerLayoutNonSearch from './buyer-layout-non-search';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Responsive Buyer Layout Wrapper
 *
 * - Mobile: BuyerLayoutNonSearch (clean navigation, bottom nav)
 * - Desktop: BuyerLayout (dropdown menu, search bar)
 */
export default function BuyerLayoutWrapper({ children, ...props }) {
    const isMobile = useIsMobile();

    // Use BuyerLayoutNonSearch for mobile, BuyerLayout for desktop
    if (isMobile) {
        return (
            <BuyerLayoutNonSearch {...props}>
                {children}
            </BuyerLayoutNonSearch>
        );
    }

    return (
        <BuyerLayout {...props}>
            {children}
        </BuyerLayout>
    );
}