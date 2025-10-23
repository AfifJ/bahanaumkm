import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { Eye, Package, Plus, Users } from 'lucide-react';

export default function SalesProductIndex({ salesUsers, recentAssignments }) {
    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Manajemen Produk Sales' },
            ]}
        >
            <Head title="Manajemen Produk Sales" />

            <div className="flex-1 space-y-4 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Manajemen Produk Sales</h2>
                        <p className="text-muted-foreground">Kelola penugasan produk kepada tim sales lapangan</p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.sales-products.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tugaskan Produk
                        </Link>
                    </Button>
                </div>


                {/* Sales Users Table */}
                <div>
                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Sales</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Produk</TableHead>
                                    <TableHead className="text-center">Total Pinjam</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div>{user.name}</div>
                                                {user.phone && (
                                                    <div className="text-sm text-muted-foreground">{user.phone}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                                {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{user.assigned_products}</TableCell>
                                        <TableCell className="text-center">{user.total_borrowed}</TableCell>
                                        <TableCell className="text-right">
                                            {user.assigned_products > 0 && (
                                                <Link href={route('admin.sales-products.sales', user)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Lihat Produk
                                                    </Button>
                                                </Link>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {salesUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                            Tidak ada sales yang terdaftar
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Recent Assignments */}
                <div>
                    <div className='mb-3'>
                        <h2 className="text-xl font-bold tracking-tight">Penugasan Terbaru</h2>
                    </div>
                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sales</TableHead>
                                    <TableHead>Produk</TableHead>
                                    <TableHead className="text-center">Dipinjam</TableHead>
                                    <TableHead className="text-center">Terjual</TableHead>
                                    <TableHead className="text-center">Tersedia</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">{assignment.sales_name}</TableCell>
                                        <TableCell>{assignment.product_name}</TableCell>
                                        <TableCell className="text-center">{assignment.borrowed_quantity}</TableCell>
                                        <TableCell className="text-center">{assignment.sold_quantity}</TableCell>
                                        <TableCell className="text-center">{assignment.current_stock}</TableCell>
                                        <TableCell>
                                            <Badge variant={assignment.status === 'borrowed' ? 'default' : 'secondary'}>
                                                {assignment.status === 'borrowed' ? 'Dipinjam' : 'Dikembalikan'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{assignment.borrowed_date}</TableCell>
                                    </TableRow>
                                ))}
                                {recentAssignments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                            Tidak ada penugasan produk
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}