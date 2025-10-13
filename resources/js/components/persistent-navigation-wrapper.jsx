import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from './mobile-bottom-nav';
import SalesMobileBottomNav from './sales-mobile-bottom-nav';

export default function PersistentNavigationWrapper({
    withBottomNav = true,
    navType = 'buyer',
    children
}) {
    const isMobile = useIsMobile();

    const renderBottomNav = () => {
        // Only show bottom nav if withBottomNav is true AND it's mobile
        if (!withBottomNav || !isMobile) return null;

        switch (navType) {
            case 'sales':
                return <SalesMobileBottomNav />;
            case 'buyer':
            default:
                return <MobileBottomNav />;
        }
    };

    return (
        <div className="relative w-full">
            <div className={withBottomNav && isMobile ? 'pb-16' : ''}>
                {children}
            </div>
            {renderBottomNav()}
        </div>
    );
}
