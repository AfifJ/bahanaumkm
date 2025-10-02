import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from './mobile-bottom-nav';

export default function PersistentNavigationWrapper({ withBottomNav = true, children }) {
    const isMobile = useIsMobile();

    return (
        <div className="relative w-full">
            <div className={isMobile ? 'pb-16' : ''}>
                {children}
            </div>
            {withBottomNav &&
                <MobileBottomNav />
            }
        </div>
    );
}
