import { Head, Link, usePage, router } from '@inertiajs/react';
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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  CheckCircle,
  Search,
  Plus,
  Filter,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';

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

// Format date without time
const formatDateOnly = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function TransactionsIndex({ transactions = [] }) {
  const { flash } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [showFlashMessage, setShowFlashMessage] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

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

  // Filter and sort transactions
  const filteredAndSortedTransactions = transactions
    .filter(trx => {
      const matchesSearch = trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.items.some(item => item.product.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || true; // No status filtering for now
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.date) - new Date(b.date);
        case 'date_desc':
          return new Date(b.date) - new Date(a.date);
        case 'amount_asc':
          return a.total_amount - b.total_amount;
        case 'amount_desc':
          return b.total_amount - a.total_amount;
        default:
          return 0;
      }
    });

  // Calculate statistics
  const totalRevenue = transactions.reduce((sum, trx) => sum + trx.total_amount, 0);
  const totalCommission = transactions.reduce((sum, trx) => sum + (trx.total_amount * 0.1), 0);
  const totalItems = transactions.reduce((sum, trx) => sum + trx.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const totalTransactions = transactions.length;

  return (
    <SalesLayout>
      <Head title="Transaksi Penjualan" />

      <div className="space-y-6 pb-20">
        {/* Flash Messages */}
        {showFlashMessage && flash?.success && (
          <Alert className="border-green-200 bg-green-50 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{flash.success}</AlertDescription>
          </Alert>
        )}

        {showFlashMessage && flash?.error && (
          <Alert className="border-red-200 bg-red-50 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{flash.error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaksi Penjualan</h1>
            <p className="text-gray-600">Kelola dan pantau semua transaksi penjualan Anda</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => alert('Export functionality will be implemented')}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href={route('sales.transactions.create')}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Semua transaksi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Revenue total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
              <p className="text-xs text-muted-foreground">
                Estimasi 10%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Items terjual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Cari Transaksi</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Cari ID atau nama produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort">Urutkan</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Terbaru</SelectItem>
                    <SelectItem value="date_asc">Terlama</SelectItem>
                    <SelectItem value="amount_desc">Tertinggi</SelectItem>
                    <SelectItem value="amount_asc">Terendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Transaksi</CardTitle>
            <CardDescription>
              Menampilkan {filteredAndSortedTransactions.length} dari {transactions.length} transaksi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAndSortedTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-600">
                  {searchTerm ? 'Tidak ada transaksi yang cocok dengan pencarian' : 'Belum ada transaksi'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transaksi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Komisi</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedTransactions.map((trx) => (
                      <TableRow key={trx.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{trx.id}</div>
                            <div className="text-xs text-gray-500">{formatDate(trx.date)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDateOnly(trx.date)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {trx.items.map((item, index) => (
                              <div key={index} className="text-sm">
                                {item.product}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {trx.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(trx.total_amount)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(trx.total_amount * 0.1)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/sales/transactions/${trx.id.replace('TRX-', '')}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SalesLayout>
  );
}
