import { Head, Link, usePage } from '@inertiajs/react';
import SalesLayout from '@/layouts/sales-layout';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function TransactionsIndex({ transactions = [] }) {
  const { flash } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [showFlashMessage, setShowFlashMessage] = useState(true);

  // Auto-hide flash messages after 5 seconds
  useEffect(() => {
    if (flash?.success || flash?.error) {
      const timer = setTimeout(() => {
        setShowFlashMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  // Reset flash message visibility when flash changes
  useEffect(() => {
    setShowFlashMessage(true);
  }, [flash]);

  const filteredTransactions = transactions.filter(trx =>
    trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trx.items.some(item => item.product.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <SalesLayout title="Transaksi">
      <Head title="Daftar Transaksi" />
      
      {/* Flash Messages */}
      {showFlashMessage && flash?.success && (
        <div className="mx-4 mt-4">
          <Alert className="border-green-200 bg-green-50 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{flash.success}</AlertDescription>
          </Alert>
        </div>
      )}

      {showFlashMessage && flash?.error && (
        <div className="mx-4 mt-4">
          <Alert className="border-red-200 bg-red-50 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{flash.error}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className="px-4 pt-6 pb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Cari transaksi berdasarkan ID atau produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md text-sm py-2 px-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Link href={route('sales.transactions.create')}>
          <Button>
            Tambah Transaksi
          </Button>
        </Link>
      </div>
      <div className="space-y-3 mx-4 divide-y *:px-2 flex flex-col *:py-2 rounded-lg border">
        <div
          className="flex justify-between items-center bg-gray-100"
        >
          <div className="font-bold">Transaksi</div>
          <div className="font-bold">
            Total
          </div>
        </div>
        {filteredTransactions.map((trx) => (
          <Link
            key={trx.id}
            href={`/sales/transactions/${trx.id.replace('TRX-', '')}`}
            className="flex justify-between items-center px-2 py-2 rounded transition-colors"
          >
            <div>
              <div className="font-semibold">{trx.id}</div>
              <div className="text-xs text-gray-500">{formatDate(trx.date)}</div>
            </div>
            <div className="font-bold text-green-700 text-sm">
              {formatCurrency(trx.total_amount)}
            </div>
          </Link>
        ))}
      </div>
      <div className='h-12'></div>
    </SalesLayout>
  );
}
