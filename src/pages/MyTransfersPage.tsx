import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTransfers } from '@/data/mock';
import { Transfer } from '@/types';

const PAGE_SIZE = 4;
const CURRENT_USER = 'أحمد محمدي';

const MyTransfersPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tab, setTab] = useState('sent');
  const [page, setPage] = useState(1);

  const myTransfers = useMemo(() => {
    const base = tab === 'sent'
      ? mockTransfers.filter(tr => tr.fromUser === CURRENT_USER)
      : mockTransfers.filter(tr => tr.toUser === CURRENT_USER);

    let result = base;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(tr =>
        tr.fromUser.toLowerCase().includes(q) ||
        tr.toUser.toLowerCase().includes(q) ||
        tr.fileId.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(tr => tr.status === statusFilter);
    }
    return result;
  }, [tab, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(myTransfers.length / PAGE_SIZE));
  const paginated = myTransfers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusFilter = (val: string) => { setStatusFilter(val); setPage(1); };
  const handleTabChange = (val: string) => { setTab(val); setPage(1); setSearch(''); setStatusFilter('all'); };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      received: 'bg-info/10 text-info border-info/20',
    };
    return <Badge variant="outline" className={styles[status]}>{t(status)}</Badge>;
  };

  const exportHeaders = [
    { key: 'id', label: t('transferId') },
    { key: 'fromUser', label: t('fromUser') },
    { key: 'toUser', label: t('toUser') },
    { key: 'fileId', label: t('file') },
    { key: 'status', label: t('status') },
    { key: 'date', label: t('date') },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('myTransfersLog')}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> {t('export')}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportToCSV(myTransfers as unknown as Record<string, string>[], exportHeaders, 'my-transfers')}>
              <FileSpreadsheet className="w-4 h-4 me-2" /> {t('exportCSV')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToPDF(myTransfers as unknown as Record<string, string>[], exportHeaders, 'my-transfers', t('myTransfersLog'))}>
              <FileText className="w-4 h-4 me-2" /> {t('exportPDF')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="flex justify-start rtl:justify-end">
        <TabsList className="grid grid-cols-2 max-w-xs">
          <TabsTrigger value="sent">{t('sentTransfers')}</TabsTrigger>
          <TabsTrigger value="received">{t('receivedTransfers')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('search')} value={search} onChange={(e) => handleSearch(e.target.value)} className="ps-9" />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={t('filterByStatus')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="pending">{t('pending')}</SelectItem>
            <SelectItem value="received">{t('received')}</SelectItem>
            <SelectItem value="completed">{t('completed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TransferTable paginated={paginated} statusBadge={statusBadge} t={t} tab={tab} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t('showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, myTransfers.length)} {t('of')} {myTransfers.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i + 1} variant={page === i + 1 ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(i + 1)}>{i + 1}</Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

const TransferTable = ({ paginated, statusBadge, t, tab }: { paginated: Transfer[]; statusBadge: (s: string) => React.ReactNode; t: (k: string) => string; tab: string }) => (
  <Card className="border-border shadow-sm">
    <CardContent className="p-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('transferId')}</TableHead>
            <TableHead>{tab === 'sent' ? t('toUser') : t('fromUser')}</TableHead>
            <TableHead>{t('file')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('date')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('noData')}</TableCell></TableRow>
          ) : paginated.map((tr) => (
            <TableRow key={tr.id}>
              <TableCell className="font-medium">#{tr.id}</TableCell>
              <TableCell>{tab === 'sent' ? tr.toUser : tr.fromUser}</TableCell>
              <TableCell>{tr.fileId}</TableCell>
              <TableCell>{statusBadge(tr.status)}</TableCell>
              <TableCell>{tr.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default MyTransfersPage;
