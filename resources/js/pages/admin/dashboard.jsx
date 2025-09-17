import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/admin-layout';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Admin Dashboard',
        href: route('admin.dashboard'),
    },
];

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="space-y-6 rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Role:</span>
                    <Badge variant="outline">{auth.user?.role || 'No role'}</Badge>
                </div>
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <pre className="relative z-10 rounded bg-gray-100 p-4 text-left text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {JSON.stringify(auth.user, null, 2)}
                    </pre>
                    <pre className="relative z-10 rounded bg-gray-100 p-4 text-left text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {JSON.stringify(auth.user, null, 2)}
                    </pre>
                </div>
            </div>
        </AppLayout>
    );
}
