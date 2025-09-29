import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';

export default function AppSidebarLayout({ userMenuItems, profileLink, homeUrl = '/', children, breadcrumbs = [], mainNavItems = [], footerNavItems = [] }) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar profileLink={profileLink} userMenuItems={userMenuItems} homeUrl={homeUrl} mainNavItems={mainNavItems} footerNavItems={footerNavItems} />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
