import { Head, usePage } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import vendorLayout from '@/layouts/vendor-layout';

const breadcrumbs = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {

    const { auth } = usePage().props;

    let Layout = AppLayout;
    if (auth.user.role_id === 1) {
        Layout = adminLayout;
    } else if (auth.user.role_id === 2) {
        Layout = vendorLayout;
    }

    return (<Layout breadcrumbs={breadcrumbs}>
        <Head title="Appearance settings" />

        <SettingsLayout>
            <div className="space-y-6">
                <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                <AppearanceTabs />
            </div>
        </SettingsLayout>
    </Layout>);
}

