import SalesLayout from "@/layouts/sales-layout"
import { Head } from "@inertiajs/react"
import { useState, useEffect } from 'react'

export default ({ auth, salesData = [], period = 'monthly' }) => {
    const [selectedPeriod, setSelectedPeriod] = useState(period)
    const [filteredData, setFilteredData] = useState([])
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    })

    const mockSalesData = [
        {
            id: 1,
            order_code: 'ORD-20241003-ABC123',
            product_name: 'Kopi Arabica',
            quantity: 5,
            total_amount: 250000,
            commission: 25000,
            buyer_name: 'Toko Maju Jaya',
            date: '2024-10-01',
            status: 'completed'
        },
        {
            id: 2,
            order_code: 'ORD-20241002-DEF456',
            product_name: 'Teh Hijau',
            quantity: 3,
            total_amount: 150000,
            commission: 15000,
            buyer_name: 'Warung Sejahtera',
            date: '2024-10-02',
            status: 'completed'
        },
        {
            id: 3,
            order_code: 'ORD-20241001-GHI789',
            product_name: 'Madu Hutan',
            quantity: 2,
            total_amount: 120000,
            commission: 12000,
            buyer_name: 'Kios Bahagia',
            date: '2024-10-01',
            status: 'completed'
        }
    ]

    useEffect(() => {
        // Filter data berdasarkan periode yang dipilih
        const filterData = () => {
            if (selectedPeriod === 'custom' && dateRange.start && dateRange.end) {
                return mockSalesData.filter(item =>
                    item.date >= dateRange.start && item.date <= dateRange.end
                )
            }
            return mockSalesData
        }
        setFilteredData(filterData())
    }, [selectedPeriod, dateRange])

    const calculateStats = () => {
        const totalSales = filteredData.reduce((sum, item) => sum + item.total_amount, 0)
        const totalCommission = filteredData.reduce((sum, item) => sum + item.commission, 0)
        const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0)
        const averageSale = filteredData.length > 0 ? totalSales / filteredData.length : 0

        return {
            totalSales,
            totalCommission,
            totalQuantity,
            averageSale,
            transactionCount: filteredData.length
        }
    }

    const stats = calculateStats()

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <SalesLayout>
            <Head title="Laporan Penjualan" />

            <div className="p-4 space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan Saat Ini</h1>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Penjualan</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Komisi</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCommission)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Produk Terjual</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    Laporan berdasarkan produk terjual
                </div>
                <div>
                    Laporan berdasarkan transaksi
                </div>

                {/* Sales Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Detail Transaksi</h2>
                    </div>

                    {filteredData.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-2">📊</div>
                            <p className="text-gray-600">Tidak ada data transaksi untuk periode yang dipilih</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kode Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produk
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Qty
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Komisi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {transaction.order_code}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {transaction.product_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {transaction.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(transaction.total_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                {formatCurrency(transaction.commission)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(transaction.date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {transaction.status === 'completed' ? 'Selesai' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </SalesLayout>
    )
}
