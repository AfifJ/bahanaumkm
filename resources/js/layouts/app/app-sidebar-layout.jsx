import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { usePage } from '@inertiajs/react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AppSidebarLayout({ userMenuItems, profileLink, homeUrl = '/', children, breadcrumbs = [], mainNavItems = [], footerNavItems = [] }) {
    const { flash } = usePage().props;

    return (
        <AppShell variant="sidebar">
            <AppSidebar profileLink={profileLink} userMenuItems={userMenuItems} homeUrl={homeUrl} mainNavItems={mainNavItems} footerNavItems={footerNavItems} />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="px-4 md:px-6">
                    {flash?.success && (
                        <Alert className="mb-4 border-green-200 bg-green-50 text-green-700">
                            <AlertDescription>{flash.success}</AlertDescription>
                        </Alert>
                    )}
                    {flash?.error && (
                        <Alert className="mb-4 border-red-200 bg-red-50 text-red-700">
                            <AlertDescription>{flash.error}</AlertDescription>
                        </Alert>
                    )}
                </div>
                {children}
            </AppContent>
        </AppShell>
    );
}
