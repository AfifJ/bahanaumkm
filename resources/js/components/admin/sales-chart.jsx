export function SalesChart({ data, title = "Sales Trend" }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getMonthName = (dateString) => {
        const date = new Date(dateString + '-01');
        return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    };

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    No data available
                </div>
            </div>
        );
    }

    // Find max values for scaling
    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const maxOrders = Math.max(...data.map(d => d.orders));

    return (
        <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <div className="space-y-4">
                    {/* Revenue Chart */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue</h4>
                        <div className="relative h-32">
                            {data.map((item, index) => (
                                <div key={index} className="absolute bottom-0 flex-1 mx-1">
                                    <div className="text-center mb-1">
                                        <div className="text-xs text-gray-600">
                                            {formatCurrency(item.revenue)}
                                        </div>
                                    </div>
                                    <div
                                        className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative"
                                        style={{
                                            height: `${(item.revenue / maxRevenue) * 100}%`,
                                            width: `${100 / data.length}%`
                                        }}
                                        title={`${getMonthName(item.month)}: ${formatCurrency(item.revenue)}`}
                                    />
                                    <div className="text-xs text-gray-500 mt-1 text-center">
                                        {getMonthName(item.month)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Orders Chart */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Orders</h4>
                        <div className="relative h-32">
                            {data.map((item, index) => (
                                <div key={index} className="absolute bottom-0 flex-1 mx-1">
                                    <div className="text-center mb-1">
                                        <div className="text-xs text-gray-600">
                                            {item.orders}
                                        </div>
                                    </div>
                                    <div
                                        className="bg-green-500 rounded-t hover:bg-green-600 transition-colors relative"
                                        style={{
                                            height: `${(item.orders / maxOrders) * 100}%`,
                                            width: `${100 / data.length}%`
                                        }}
                                        title={`${getMonthName(item.month)}: ${item.orders} orders`}
                                    />
                                    <div className="text-xs text-gray-500 mt-1 text-center">
                                        {getMonthName(item.month)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
        </div>
    );
}