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

const Index = ({ report, skuReports, availableMonths = [], month: initialMonth = '' }) => {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth || getCurrentMonth());

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleMonthChange = (value) => {
        setSelectedMonth(value);
        router.get(route('vendor.report.index'), { month: value }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Flatten data to show both regular products and SKUs
    const flattenedData = useMemo(() => {
        const data = [];

        // Add regular products (without variations)
        report?.filter(item => !item.has_variations).forEach(item => {
            data.push({
                product_code: `${item.product_id}`,
                product_name: item.product_name,
                total_quantity: item.total_quantity,
                buy_price: item.buy_price,
                total_revenue: item.total_revenue,
            });
        });

        // Add SKU variations (products with variations)
        if (skuReports && typeof skuReports === 'object') {
            Object.values(skuReports).forEach((productSkus) => {
                if (Array.isArray(productSkus)) {
                    productSkus.forEach(sku => {
                        data.push({
                            product_code: sku.sku_code,
                            product_name: sku.product_name + (sku.variation_summary ? ` (${sku.variation_summary})` : ''),
                            total_quantity: sku.total_quantity,
                            buy_price: sku.sku_buy_price,
                            total_revenue: sku.total_revenue,
                        });
                    });
                }
            });
        }

        return data;
    }, [report, skuReports]);

    const totalRevenue = useMemo(() => {
        return flattenedData.reduce((acc, curr) => {
            return acc + parseFloat(curr.total_revenue);
        }, 0);
    }, [flattenedData]);

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
                <div className="mx-auto max-w-7xl sm:px-6  ">
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
                                Total Penjualan: {formatCurrency(totalRevenue)}
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold">Kode Produk</TableHead>
                                    <TableHead className="font-semibold">Nama Produk</TableHead>
                                    <TableHead className="font-semibold">Terjual</TableHead>
                                    <TableHead className="font-semibold">Harga</TableHead>
                                    <TableHead className="font-semibold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {flattenedData.map((item, key) => (
                                    <TableRow key={key}>
                                        <TableCell>{item.product_code}</TableCell>
                                        <TableCell>{item.product_name}</TableCell>
                                        <TableCell>{item.total_quantity.toLocaleString('id-ID')}</TableCell>
                                        <TableCell>{formatCurrency(item.buy_price)}</TableCell>
                                        <TableCell>{formatCurrency(item.total_revenue)}</TableCell>
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