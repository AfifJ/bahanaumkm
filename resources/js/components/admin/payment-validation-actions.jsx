import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';

export function PaymentValidationActions({
  order,
  onSuccess,
  showQuickActions = true
}) {
  const { processing } = useForm();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'validation':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      validation: 'bg-blue-100 text-blue-800 border-blue-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
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

  const handleApprove = () => {
    router.put(route('admin.transaction.update', order.id), {
      status: 'paid',
      paid_at: new Date().toISOString(),
    }, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (errors) => {
        console.error('Approval failed:', errors);
      }
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      return;
    }

    router.put(route('admin.transaction.update', order.id), {
      status: 'rejected',
      reject_reason: rejectReason,
    }, {
      onSuccess: () => {
        setShowRejectModal(false);
        setRejectReason('');
        onSuccess?.();
      },
      onError: (errors) => {
        console.error('Rejection failed:', errors);
      }
    });
  };

  const canApprove = ['validation'].includes(order.status);
  const canReject = ['pending', 'validation'].includes(order.status);

  if (!showQuickActions) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(order.status)}>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            <span>{getStatusLabel(order.status)}</span>
          </div>
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {canApprove && (
          <Button
            onClick={handleApprove}
            disabled={processing}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {processing ? 'Memproses...' : 'Validasi Pembayaran'}
          </Button>
        )}

        {canReject && (
          <Button
            onClick={() => setShowRejectModal(true)}
            disabled={processing}
            size="sm"
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Tolak Pembayaran
          </Button>
        )}

        {/* View Proof */}
        {order.payment_proof && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/storage/${order.payment_proof}`, '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Lihat Bukti
          </Button>
        )}
      </div>

      {/* Status Badge */}
      <Badge className={getStatusColor(order.status)}>
        <div className="flex items-center gap-2">
          {getStatusIcon(order.status)}
          <span className="font-medium">{getStatusLabel(order.status)}</span>
        </div>
      </Badge>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Tolak Pembayaran</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Penolakan
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Masukkan alasan penolakan pembayaran..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectReason.trim() || processing}
                variant="destructive"
              >
                {processing ? 'Memproses...' : 'Tolak'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Info Summary */}
      {order.payment_method && (
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Metode Pembayaran:</span>
            <span className="text-gray-600">{order.payment_method.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-medium">Total:</span>
            <span className="text-gray-900 font-semibold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(order.total_amount)}
            </span>
          </div>
          {order.paid_at && (
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium">Dibayar:</span>
              <span className="text-gray-600">
                {new Date(order.paid_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}