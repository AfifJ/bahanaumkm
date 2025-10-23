import VendorLayout from "@/layouts/vendor-layout"
import { Head, router } from "@inertiajs/react"
import { useMemo, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { route } from 'ziggy-js';

const getCurrentMonth = () => {
    const now = new Date();
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
};

const Index = ({ orders, availableMonths = [], month: initialMonth = '' }) => {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth || getCurrentMonth());
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleMonthChange = (value) => {
        setSelectedMonth(value);
        router.get(route('vendor.transaction.index'), { month: value }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    console.log(orders);

    const flattenedData = useMemo(() => {
        const data = []
        orders.data.forEach(order => {
            order.items.forEach(item => {
                data.push({
                    order_code: order.order_code,
                    created_at: order.created_at,
                    product_name: item.product?.name ?? '—',
                    image_url: item.product?.image_url ?? '—',
                    quantity: item.quantity ?? item.quantityi ?? '—',
                    price: item.product?.buy_price ?? '—',
                    vendor_name: item.product?.vendor?.name ?? '—',
                })
            })
        })
        return data
    }, [orders.data])

    return (
        <VendorLayout
            title="Transaksi"
            breadcrumbs={[
                {
                    title: 'Transaksi',
                    href: route('vendor.transaction.index'),
                },
            ]}
        >
            <Head title="Transaksi" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {availableMonths.length > 0 && <Select value={selectedMonth} onValueChange={handleMonthChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={selectedMonth || "Pilih Bulan"} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths.map((monthYear) => (
                                <SelectItem key={monthYear} value={monthYear}>
                                    {monthYear}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>}
                    <div className="bg-white mt-6 shadow-sm rounded-lg overflow-hidden">

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold">Order Code</TableHead>
                                    <TableHead className="font-semibold">Tanggal</TableHead>
                                    <TableHead className="font-semibold">Produk</TableHead>
                                    <TableHead className="font-semibold">Qty</TableHead>
                                    <TableHead className="font-semibold">Harga</TableHead>
                                    {/* <TableHead className="font-semibold">Vendor</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {flattenedData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{row.order_code}</TableCell>
                                        <TableCell>{formatDate(row.created_at)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {row.image_url !== '—' && (
                                                    <img
                                                        src={row.image_url}
                                                        alt={row.product_name}
                                                        className="w-8 h-8 rounded object-cover"
                                                    />
                                                )}
                                                <span>{row.product_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{row.quantity}</TableCell>
                                        <TableCell>{row.price}</TableCell>
                                        {/* <TableCell>{row.vendor_name}</TableCell> */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </VendorLayout>
    )
}

export default Index