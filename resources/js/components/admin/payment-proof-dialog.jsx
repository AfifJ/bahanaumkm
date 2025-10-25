import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function PaymentProofDialog({ isOpen, onClose, proofPath }) {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Bukti Pembayaran</h2>
                </div>

                <div className="mb-4">
                    <img
                        src={proofPath ? `/storage/${proofPath}` : ''}
                        alt="Delivery Proof"
                        className="w-full h-64 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em"%3EPeringatan tidak dapat dimuat%3C/text%3E%3C/svg%3E';
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
