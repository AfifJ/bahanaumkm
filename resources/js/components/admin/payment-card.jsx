import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle, Calendar, User, MapPin } from 'lucide-react';

export function PaymentCard({ order, onViewProof, onApprove, onReject, compact = false }) {
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImageError = (event) => {
    event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E';
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600">#{order.order_code}</p>
              <p className="text-xs text-gray-500">
                {formatDate(order.created_at)}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                <span className="text-xs">{getStatusLabel(order.status)}</span>
              </div>
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(order.total_amount)}
              </p>
            </div>
            <div className="flex gap-1">
              {order.payment_proof && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewProof(order.payment_proof)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
              {order.status === 'validation' && onApprove && (
                <Button
                  size="sm"
                  onClick={() => onApprove(order)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">#{order.order_code}</CardTitle>
            <p className="text-sm text-gray-500">
              <Calendar className="inline h-3 w-3 mr-1" />
              {formatDate(order.created_at)}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className="font-medium">{getStatusLabel(order.status)}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Method */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Metode:</span>
          <span className="text-sm font-semibold text-gray-900 uppercase">
            {order.payment_method || 'QRIS'}
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Total:</span>
          <span className="text-lg font-bold text-green-600">
            {formatPrice(order.total_amount)}
          </span>
        </div>

        {/* Payment Proof */}
        {order.payment_proof && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Bukti Pembayaran:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProof(order.payment_proof)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Lihat
              </Button>
            </div>
            <div className="bg-gray-100 rounded-lg p-2">
              <img
                src={`/storage/${order.payment_proof}`}
                alt="Payment Proof"
                className="h-24 w-auto mx-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onViewProof(order.payment_proof)}
                onError={handleImageError}
              />
            </div>
          </div>
        )}

        {/* Customer Info */}
        {(order.buyer || order.mitra) && (
          <div className="border-t pt-3 space-y-1">
            {order.buyer && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Pembeli:</span>
                <span className="font-medium text-gray-900">{order.buyer.name}</span>
              </div>
            )}
            {order.mitra && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Tujuan:</span>
                <span className="font-medium text-gray-900">{order.mitra.hotel_name}</span>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {order.paid_at && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">
              Dibayar pada: {formatDate(order.paid_at)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {order.status === 'validation' && (
          <div className="flex gap-2">
            <Button
              onClick={() => onApprove(order)}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Validasi Pembayaran
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject(order)}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Tolak Pembayaran
            </Button>
          </div>
        )}

        {order.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onViewProof(order.payment_proof)}
              disabled={!order.payment_proof}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              {order.payment_proof ? 'Lihat Bukti' : 'Belum Ada Bukti'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject(order)}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Tolak Pembayaran
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}