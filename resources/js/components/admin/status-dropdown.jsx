import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import { PaymentStatusBadge } from './payment-status-badge';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

export function StatusDropdown({ order, onSuccess }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    // Define allowed status transitions (same as backend)
    const allowedTransitions = {
        'pending': ['validation', 'cancelled'],
        'validation': ['paid', 'payment_rejected', 'cancelled'],
        'paid': ['processed', 'cancelled'],
        'processed': ['out_for_delivery', 'cancelled'],
        'out_for_delivery': ['delivered', 'failed_delivery'],
        'delivered': ['returned'],
        'payment_rejected': ['validation', 'cancelled'],
        'failed_delivery': ['out_for_delivery', 'cancelled'],
        'returned': ['refunded'],
        'refunded': [],
        'cancelled': [],
    };

    const statusOptions = [
        { value: 'pending', label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'validation', label: 'Menunggu Validasi', color: 'bg-blue-100 text-blue-800' },
        { value: 'paid', label: 'Sudah Dibayar', color: 'bg-green-100 text-green-800' },
        { value: 'processed', label: 'Diproses', color: 'bg-orange-100 text-orange-800' },
        { value: 'out_for_delivery', label: 'Sedang Diantar Kurir', color: 'bg-cyan-100 text-cyan-800' },
        { value: 'delivered', label: 'Telah Sampai', color: 'bg-emerald-100 text-emerald-800' },
        { value: 'payment_rejected', label: 'Pembayaran Ditolak', color: 'bg-red-100 text-red-800' },
        { value: 'failed_delivery', label: 'Pengiriman Gagal', color: 'bg-orange-100 text-orange-800' },
        { value: 'returned', label: 'Dikembalikan', color: 'bg-gray-100 text-gray-800' },
        { value: 'refunded', label: 'Direfund', color: 'bg-slate-100 text-slate-800' },
        { value: 'cancelled', label: 'Dibatalkan', color: 'bg-gray-100 text-gray-800' },
    ];

    const handleStatusChange = (newStatus) => {
        if (newStatus === order.status || isUpdating) return;

        // Special validation: Cannot change to "delivered" without delivery proof
        if (newStatus === 'delivered' && order.status === 'out_for_delivery' && !order.delivery_proof) {
            toast.error('Harap upload bukti pengiriman terlebih dahulu sebelum mengubah status menjadi "Telah Sampai"', 'error');
            return;
        }

        // Validate status transition
        const allowedNextStatuses = allowedTransitions[order.status] || [];
        if (!allowedNextStatuses.includes(newStatus)) {
            const currentStatusLabel = statusOptions.find(opt => opt.value === order.status)?.label || order.status;
            const newStatusLabel = statusOptions.find(opt => opt.value === newStatus)?.label || newStatus;

            toast.error(`Tidak dapat mengubah status dari "${currentStatusLabel}" ke "${newStatusLabel}"`, 'error');
            return;
        }

        setIsUpdating(true);

        const updateData = {
            status: newStatus,
        };

        // Add paid_at timestamp if status is being changed to paid
        if (newStatus === 'paid') {
            updateData.paid_at = new Date().toISOString();
        }

        router.put(route('admin.transaction.update', order.id), updateData, {
            onSuccess: () => {
                setIsUpdating(false);
                const newStatusLabel = statusOptions.find(opt => opt.value === newStatus)?.label || newStatus;
                toast.success(`Status berhasil diubah ke "${newStatusLabel}"`);
                onSuccess?.();
            },
            onError: (errors) => {
                console.error('Status update failed:', errors);
                const errorMessage = errors.status || errors.message || 'Gagal mengubah status';
                toast.error(errorMessage);
                setIsUpdating(false);
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Select
                value={order.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
            >
                <SelectTrigger className="h-fit p-0 shadow-none border-0">
                    <PaymentStatusBadge status={order.status} order={order} />
                </SelectTrigger>
                <SelectContent align="end" className="w-48">
                    {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                                <Badge className={`${option.color}`}>
                                    {option.label}
                                </Badge>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}