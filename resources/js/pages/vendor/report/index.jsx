import VendorLayout from "@/layouts/vendor-layout"
import { Head, router } from "@inertiajs/react"
import { route } from 'ziggy-js';
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

const getCurrentMonth = () => {
    const now = new Date();
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
};

const Index = ({ report, availableMonths = [], month: initialMonth = '' }) => {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth || getCurrentMonth());

    const totalRevenue = useMemo(() => {
        return report?.reduce((acc, curr) => {
            return acc + parseFloat(curr.total_revenue);
        }, 0);
    }, [report]);

    const handleMonthChange = (value) => {
        setSelectedMonth(value);
        router.get(route('vendor.report.index'), { month: value }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <VendorLayout
            title="Laporan"
            breadcrumbs={[
                {
                    title: 'Laporan',
                    href: route('vendor.report.index'),
                },
            ]}
        >
            <Head title="Laporan" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="">
                        <div>
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
                            <h3 className="text-lg my-4 font-medium leading-6 text-gray-900">
                                Total Penjualan: Rp. {totalRevenue?.toLocaleString('id-ID')}
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold">Kode Produk</TableHead>
                                    <TableHead className="font-semibold">Nama Produk</TableHead>
                                    <TableHead className="font-semibold">Terjual</TableHead>
                                    <TableHead className="font-semibold">Harga Satuan</TableHead>
                                    <TableHead className="font-semibold">Total</TableHead>
                                    {/* <TableHead className="font-semibold"></TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report?.map((item, key) => (
                                    <TableRow key={key}>
                                        <TableCell>{item.product_id}</TableCell>
                                        <TableCell>{item.product_name}</TableCell>
                                        <TableCell>{item.total_quantity}</TableCell>
                                        <TableCell>Rp{parseFloat(item.buy_price).toLocaleString('id-ID')}</TableCell>
                                        <TableCell>Rp{parseFloat(item.total_revenue).toLocaleString('id-ID')}</TableCell>
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