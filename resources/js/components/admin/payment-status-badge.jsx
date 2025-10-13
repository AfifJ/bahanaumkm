import { Badge } from '@/components/ui/badge';
import { Clock, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PaymentStatusBadge({ status, size = 'default', showIcon = true, className }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'validation':
        return <Eye className="h-4 w-4" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50',
      validation: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50',
      paid: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-50',
      rejected: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-50',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50',
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Menunggu Pembayaran',
      validation: 'Menunggu Validasi',
      paid: 'Sudah Dibayar',
      rejected: 'Ditolak',
      cancelled: 'Dibatalkan',
    };
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

  const iconSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  return (
    <Badge
      className={cn(
        'font-medium transition-all duration-200 cursor-default',
        getStatusColor(status),
        getSizeClasses(),
        className
      )}
    >
      <div className="flex items-center gap-1">
        {showIcon && (
          <div className={iconSizeClass()}>
            {getStatusIcon(status)}
          </div>
        )}
        <span>{getStatusLabel(status)}</span>
      </div>
    </Badge>
  );
}

export default PaymentStatusBadge;