import SalesLayout from "@/layouts/sales-layout"
import { Head, usePage, router } from "@inertiajs/react"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount)
}

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// Simple Line Chart Component
const LineChart = ({ data, dataKey, xAxisKey, color = '#3b82f6' }) => {
    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data.map(d => d[dataKey]))
    const minValue = 0
    const range = maxValue - minValue

    return (
        <div className="w-full h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                    <line
                        key={i}
                        x1="40"
                        y1={20 + i * 40}
                        x2="380"
                        y2={20 + i * 40}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                    />
                ))}

                {/* Data line */}
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={data.map((d, i) => {
                        const x = 40 + (i / (data.length - 1)) * 340
                        const y = 180 - ((d[dataKey] - minValue) / range) * 160
                        return `${x},${y}`
                    }).join(' ')}
                />

                {/* Data points */}
                {data.map((d, i) => {
                    const x = 40 + (i / (data.length - 1)) * 340
                    const y = 180 - ((d[dataKey] - minValue) / range) * 160
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill={color}
                        />
                    )
                })}

                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map(i => (
                    <text
                        key={i}
                        x="30"
                        y={25 + i * 40}
                        textAnchor="end"
                        className="text-xs fill-gray-600"
                    >
                        {formatCurrency(maxValue - (i * range / 4))}
                    </text>
                ))}

                {/* X-axis labels */}
                {data.map((d, i) => (
                    <text
                        key={i}
                        x={40 + (i / (data.length - 1)) * 340}
                        y="195"
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                    >
                        {formatDate(d[xAxisKey])}
                    </text>
                ))}
            </svg>
        </div>
    )
}

// Simple Bar Chart Component
const BarChart = ({ data, dataKey, xAxisKey, color = '#10b981' }) => {
    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data.map(d => d[dataKey]))

    return (
        <div className="w-full h-64">
            <div className="flex items-end justify-between h-48 gap-2">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center">
                            <span className="text-xs font-medium mb-1">
                                {formatCurrency(d[dataKey])}
                            </span>
                            <div
                                className="w-full bg-blue-500 rounded-t"
                                style={{
                                    height: `${(d[dataKey] / maxValue) * 100}%`,
                                    backgroundColor: color
                                }}
                            />
                        </div>
                        <span className="text-xs text-gray-600 mt-1 text-center">
                            {d[xAxisKey]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function SalesReports() {
    const { summary = {}, dailySales = [], topProducts = [], monthlyTrends = [], inventoryStats = {}, filters = {} } = usePage().props;
    const [selectedPeriod, setSelectedPeriod] = useState('30days')
    const [dateRange, setDateRange] = useState({
        start: filters.startDate || '',
        end: filters.endDate || ''
    })
    const [activeTab, setActiveTab] = useState('overview')

    // Calculate percentage changes
    const getPercentageChange = (current, previous) => {
        if (!previous) return 0
        return ((current - previous) / previous) * 100
    }

    const handleDateFilter = () => {
        router.get(
            route('sales.reports'),
            {
                start_date: dateRange.start,
                end_date: dateRange.end
            },
            { preserveState: true }
        )
    }

    const handleExport = (format = 'csv') => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('sales.reports.export');

        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken.getAttribute('content');
            form.appendChild(csrfInput);
        }

        // Add date range filters
        const startDateInput = document.createElement('input');
        startDateInput.type = 'hidden';
        startDateInput.name = 'start_date';
        startDateInput.value = dateRange.start;
        form.appendChild(startDateInput);

        const endDateInput = document.createElement('input');
        endDateInput.type = 'hidden';
        endDateInput.name = 'end_date';
        endDateInput.value = dateRange.end;
        form.appendChild(endDateInput);

        // Add format
        const formatInput = document.createElement('input');
        formatInput.type = 'hidden';
        formatInput.name = 'format';
        formatInput.value = format;
        form.appendChild(formatInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    }

    return (
        <SalesLayout>
            <Head title="Laporan Penjualan" />

            <div className="space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
                        <p className="text-gray-600">Analisis performa penjualan dan komisi Anda</p>
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExport('csv')}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('excel')}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as Excel
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Date Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Filter Periode
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="end_date">Tanggal Selesai</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleDateFilter} className="w-full">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                Dari {summary.totalOrders} transaksi
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalCommission)}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.commissionRate}% dari penjualan
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.totalItems}</div>
                            <p className="text-xs text-muted-foreground">
                                Produk terjual
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rata-rata Transaksi</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.averageOrderValue)}</div>
                            <p className="text-xs text-muted-foreground">
                                Per transaksi
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts and Data */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="trends">Tren</TabsTrigger>
                        <TabsTrigger value="products">Produk</TabsTrigger>
                        <TabsTrigger value="inventory">Inventaris</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Penjualan Harian</CardTitle>
                                    <CardDescription>Penjualan dan komisi per hari</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {dailySales.length > 0 ? (
                                        <LineChart data={dailySales} dataKey="revenue" xAxisKey="date" />
                                    ) : (
                                        <div className="h-64 flex items-center justify-center text-gray-500">
                                            Belum ada data penjualan
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Statistik Inventaris</CardTitle>
                                    <CardDescription>Status produk yang dipinjam</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span>Total Dipinjam:</span>
                                            <span className="font-semibold">{inventoryStats.total_borrowed}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Terjual:</span>
                                            <span className="font-semibold">{inventoryStats.total_sold}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Stok Saat Ini:</span>
                                            <span className="font-semibold">{inventoryStats.current_stock}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Produk Aktif:</span>
                                            <span className="font-semibold">{inventoryStats.active_products}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="trends" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tren Bulanan</CardTitle>
                                <CardDescription>Performa penjualan per bulan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {monthlyTrends.length > 0 ? (
                                    <BarChart data={monthlyTrends} dataKey="revenue" xAxisKey="month" />
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-gray-500">
                                        Belum ada data bulanan
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Produk Terlaris</CardTitle>
                                <CardDescription>10 produk dengan penjualan tertinggi</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topProducts.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Produk</TableHead>
                                                <TableHead className="text-right">Qty</TableHead>
                                                <TableHead className="text-right">Revenue</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topProducts.map((product, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell className="text-right">{product.quantity}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Belum ada data produk
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="inventory" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Inventaris</CardTitle>
                                <CardDescription>Status semua produk yang dipinjam</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produk</TableHead>
                                            <TableHead>Dipinjam</TableHead>
                                            <TableHead>Terjual</TableHead>
                                            <TableHead>Sisa</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Array.isArray(usePage().props.borrowedProducts) && usePage().props.borrowedProducts.length > 0 ? (
                                            usePage().props.borrowedProducts.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.product?.name || 'Unknown'}</TableCell>
                                                    <TableCell>{item.borrowed_quantity}</TableCell>
                                                    <TableCell>{item.sold_quantity}</TableCell>
                                                    <TableCell>{item.borrowed_quantity - item.sold_quantity}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.status === 'borrowed' ? 'default' : 'secondary'}>
                                                            {item.status === 'borrowed' ? 'Dipinjam' : 'Dikembalikan'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                    Belum ada data inventaris
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </SalesLayout>
    )
}
