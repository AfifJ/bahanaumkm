import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth } = usePage().props;
    const products = [
        {
            id: 1,
            name: 'Product 1',
            image_url: 'https://via.placeholder.com/150',
            description: 'This is a description for Product 1.',
            price: 100000,
        },
        {
            id: 2,
            name: 'Product 2',
            image_url: 'https://via.placeholder.com/150',
            description: 'This is a description for Product 2.',
            price: 200000,
        },
        {
            id: 3,
            name: 'Product 3',
            image_url: 'https://via.placeholder.com/150',
            description: 'This is a description for Product 3.',
            price: 300000,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products && products.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            {product.image_url && (
                                <img 
                                    src={product.image_url} 
                                    alt={product.name}
                                    className="w-full h-48 object-cover rounded mt-2"
                                />
                            )}
                            <p className="text-gray-600 mt-2">{product.description}</p>
                            <p className="font-bold mt-2">Rp {product.price?.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
