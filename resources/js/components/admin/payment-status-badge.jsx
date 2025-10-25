import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PaymentStatusBadge({ status, size = 'default', className, order }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50',
      validation: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50',
      paid: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-50',
      processed: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-50',
      out_for_delivery: 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-50',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50',
      rejected: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-50',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50',
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status, order) => {
    const labels = {
      pending: 'Menunggu Pembayaran',
      validation: 'Menunggu Validasi',
      paid: 'Sudah Dibayar',
      processed: 'Diproses',
      out_for_delivery: 'Sedang Diantar Kurir',
      delivered: 'Sudah Sampai',
      rejected: 'Ditolak',
      cancelled: 'Dibatalkan',
    };

    // Jika status delivered tapi belum konfirmasi, tampilkan "Sudah Sampai"
    if (status === 'delivered' && order && !order.delivered_confirmed_at) {
      return 'Sudah Sampai';
    }

    return labels[status] || status;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  return (
    <Badge
      className={cn(
        'font-medium transition-all duration-200 cursor-default',
        getStatusColor(status),
        className
      )}
    >
      <span>{getStatusLabel(status, order)}</span>
    </Badge>
  );
}

export default PaymentStatusBadge;