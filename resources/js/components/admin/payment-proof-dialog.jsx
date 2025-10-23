import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PaymentProofDialog = ({ isOpen, onClose, proofPath }) => {
    const handleImageError = (event) => {
        event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Bukti Pembayaran</DialogTitle>
                </DialogHeader>
                <div className="p-6 pt-0">
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4 h-[calc(90vh-120px)]">
                        <img
                            src={`/storage/${proofPath}`}
                            alt="Bukti Pembayaran"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            onError={handleImageError}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentProofDialog;