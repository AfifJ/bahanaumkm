import { Head, usePage, Link } from '@inertiajs/react';
import SalesLayout from '@/layouts/sales-layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Calendar, DollarSign, CheckCircle, ArrowLeft } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function TransactionShow() {
  const { flash, transaction } = usePage().props;

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Selesai'
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Menunggu'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Dibatalkan'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <SalesLayout withBottomNav={false} backLink="/sales/transactions" title="Detail Transaksi">
      <Head title={`Detail Transaksi ${transaction.id}`} />

      <div className="p-3 space-y-4">
        {flash?.error && (
          <Alert className="border-red-200 bg-red-50 text-red-700">
            <AlertDescription className="text-sm">{flash.error}</AlertDescription>
          </Alert>
        )}

        {flash?.success && (
          <Alert className="border-green-200 bg-green-50 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{flash.success}</AlertDescription>
          </Alert>
        )}

        {/* Transaction Header - Compact */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h1 className="text-md font-bold text-gray-900 mb-1">{transaction.id}</h1>
              <p className="text-sm text-gray-500">Kode: {transaction.order_code}</p>
            </div>
            {getStatusBadge(transaction.status)}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Tanggal</p>
                <p className="font-medium text-gray-900 text-sm">{formatDate(transaction.date)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-medium text-gray-900 text-base">{formatCurrency(transaction.total_amount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items List - Compact */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detail Produk ({transaction.items.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {transaction.items.map((item) => (
              <div key={item.id} className="p-3">
                <div className="flex items-start space-x-3">
                  {/* Product Image - Smaller */}
                  <div className="flex-shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details - Compact */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 truncate">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.product.category.name}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span>
                          <span className="font-medium">Qty:</span> {item.quantity}
                        </span>
                        <span className="hidden sm:inline">
                          <span className="font-medium">@</span> {formatCurrency(item.unit_price)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-green-600">
                          {formatCurrency(item.total_price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary - Compact */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(transaction.total_amount)}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {transaction.items.length} produk
            </div>
          </div>
        </div>
      </div>
    </SalesLayout>
  );
}