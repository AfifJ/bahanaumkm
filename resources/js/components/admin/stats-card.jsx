import { Card, CardContent } from '@/components/ui/card';

export function StatsCard({ title, value, icon: Icon, change, changeType, description }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const displayValue = typeof value === 'number' && title.toLowerCase().includes('revenue')
        ? formatCurrency(value)
        : formatNumber(value);

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{displayValue}</p>
                        {change !== undefined && (
                            <div className="flex items-center mt-2">
                                <span className={`text-sm font-medium ${
                                    changeType === 'positive' ? 'text-green-600' :
                                    changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                    {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'} {change}
                                </span>
                                {description && (
                                    <span className="text-sm text-gray-500 ml-1">{description}</span>
                                )}
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div className="ml-4">
                            <div className="bg-blue-100 rounded-full p-3">
                                <Icon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}