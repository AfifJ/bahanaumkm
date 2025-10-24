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
        'validation': ['paid', 'cancelled'],
        'paid': ['processed', 'cancelled'],
        'processed': ['shipped', 'cancelled'],
        'shipped': ['delivered'],
        'delivered': [],
        'rejected': [],
        'cancelled': [],
    };

    const statusOptions = [
        { value: 'pending', label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'validation', label: 'Menunggu Validasi', color: 'bg-blue-100 text-blue-800' },
        { value: 'paid', label: 'Sudah Dibayar', color: 'bg-green-100 text-green-800' },
        { value: 'processed', label: 'Diproses', color: 'bg-orange-100 text-orange-800' },
        { value: 'shipped', label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
        { value: 'delivered', label: 'Diterima', color: 'bg-emerald-100 text-emerald-800' },
        { value: 'rejected', label: 'Ditolak', color: 'bg-red-100 text-red-800' },
        { value: 'cancelled', label: 'Dibatalkan', color: 'bg-gray-100 text-gray-800' },
    ];

    const handleStatusChange = (newStatus) => {
        if (newStatus === order.status || isUpdating) return;

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
                <SelectTrigger className="w-8 h-6 p-0 border-0 bg-transparent hover:bg-gray-100 rounded">
                    <PaymentStatusBadge status={order.status} size="sm" />
                    {/* <ChevronDown className="h-3 w-3 text-gray-500" /> */}
                </SelectTrigger>
                <SelectContent align="end" className="w-48">
                    {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                                <Badge className={`${option.color} border-0 text-xs font-medium`}>
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