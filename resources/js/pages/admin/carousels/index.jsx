import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, PlusIcon, Trash2, ToggleLeft, ToggleRight, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

export default function Index({ carousels }) {
    const [draggedItem, setDraggedItem] = useState(null);

    const handleDelete = (carousel) => {
        router.delete(route('admin.carousels.destroy', carousel));
    };

    const handleToggleStatus = (carousel) => {
        router.post(route('admin.carousels.toggle-status', carousel));
    };

    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();

        if (draggedItem === null || draggedItem === dropIndex) return;

        const newCarousels = [...carousels];
        const draggedCarousel = newCarousels[draggedItem];

        // Remove from old position
        newCarousels.splice(draggedItem, 1);

        // Insert at new position
        newCarousels.splice(dropIndex, 0, draggedCarousel);

        // Update sort orders
        const updatedCarousels = newCarousels.map((carousel, index) => ({
            id: carousel.id,
            sort_order: index,
        }));

        // Send update to server
        router.post(route('admin.carousels.update-order'), {
            carousels: updatedCarousels,
        }, {
            preserveScroll: true,
        });

        setDraggedItem(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout
            title="Carousel Management"
            breadcrumbs={[
                {
                    title: 'Carousel',
                    href: route('admin.carousels.index'),
                },
            ]}
        >
            <Head title="Carousel Management" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-row items-center justify-between pb-4">
                        <h2 className="text-2xl font-bold">Carousel Management</h2>
                        <Button asChild>
                            <Link href={route('admin.carousels.create')}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Carousel
                            </Link>
                        </Button>
                    </div>

                    {carousels.length === 0 ? (
                        <div className="text-center py-12">
                            <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No Carousels Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create your first carousel to display on the home page.
                            </p>
                            <Button asChild>
                                <Link href={route('admin.carousels.create')}>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add Your First Carousel
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Tip:</strong> Drag and drop rows to reorder carousels. The order will be reflected on the home page.
                                </p>
                            </div>

                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="w-12">Order</TableHead>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Link</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {carousels.map((carousel, index) => (
                                        <TableRow
                                            key={carousel.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index)}
                                            className="cursor-move hover:bg-gray-50"
                                        >
                                            <TableCell>
                                                <div className="flex items-center text-gray-400">
                                                    <ArrowUpDown className="h-4 w-4" />
                                                    <span className="ml-1 text-sm">{carousel.sort_order}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-16 w-24 overflow-hidden rounded-md border">
                                                    <img
                                                        src={carousel.image_url}
                                                        alt={carousel.title || `Carousel ${carousel.id}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <p className="font-medium text-gray-900">
                                                        {carousel.title || 'No Title'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    {carousel.link_url ? (
                                                        <a
                                                            href={carousel.link_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm truncate block"
                                                        >
                                                            {carousel.link_url}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">No Link</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={carousel.is_active ? 'default' : 'secondary'}>
                                                    {carousel.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600">
                                                    {formatDate(carousel.created_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(carousel)}
                                                        className={carousel.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                                                    >
                                                        {carousel.is_active ? (
                                                            <ToggleLeft className="h-4 w-4" />
                                                        ) : (
                                                            <ToggleRight className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('admin.carousels.edit', carousel)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the carousel and its image. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction asChild>
                                                                    <button
                                                                        onClick={() => handleDelete(carousel)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}