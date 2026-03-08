import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockTransfers, mockUsers, mockFiles } from '@/data/mock';
import { Transfer, TransferStatus } from '@/types';

const PAGE_SIZE = 5;

const TransfersPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<Transfer[]>(mockTransfers);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ fromUser: '', toUser: '', fileId: '', status: 'pending' as TransferStatus });

  const filtered = useMemo(() => {
    let result = transfers;
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
  }, [transfers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusFilter = (val: string) => { setStatusFilter(val); setPage(1); };

  const handleAdd = () => {
    const newTransfer: Transfer = { id: String(transfers.length + 1), ...form, date: new Date().toISOString().split('T')[0] };
    setTransfers([...transfers, newTransfer]);
    setOpen(false);
    setForm({ fromUser: '', toUser: '', fileId: '', status: 'pending' });
    toast({ title: t('transferAdded') });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      received: 'bg-info/10 text-info border-info/20',
    };
    return <Badge variant="outline" className={styles[status]}>{t(status)}</Badge>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('transferManagement')}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> {t('addTransfer')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{t('addTransfer')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>{t('selectFile')}</Label>
                <Select value={form.fileId} onValueChange={(v) => setForm({ ...form, fileId: v })}>
                  <SelectTrigger><SelectValue placeholder={t('selectFile')} /></SelectTrigger>
                  <SelectContent>{mockFiles.map((f) => (<SelectItem key={f.id} value={f.fileNumber}>{f.fileNumber}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('fromUser')}</Label>
                <Select value={form.fromUser} onValueChange={(v) => setForm({ ...form, fromUser: v })}>
                  <SelectTrigger><SelectValue placeholder={t('selectUser')} /></SelectTrigger>
                  <SelectContent>{mockUsers.map((u) => (<SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('toUser')}</Label>
                <Select value={form.toUser} onValueChange={(v) => setForm({ ...form, toUser: v })}>
                  <SelectTrigger><SelectValue placeholder={t('selectUser')} /></SelectTrigger>
                  <SelectContent>{mockUsers.map((u) => (<SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('status')}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TransferStatus })}>
                  <SelectTrigger><SelectValue placeholder={t('selectStatus')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="received">{t('received')}</SelectItem>
                    <SelectItem value="completed">{t('completed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAdd} className="flex-1">{t('save')}</Button>
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">{t('cancel')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
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

      <Card className="border-border shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('transferId')}</TableHead>
                <TableHead>{t('fromUser')}</TableHead>
                <TableHead>{t('toUser')}</TableHead>
                <TableHead>{t('file')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('noData')}</TableCell></TableRow>
              ) : paginated.map((tr) => (
                <TableRow key={tr.id}>
                  <TableCell className="font-medium">#{tr.id}</TableCell>
                  <TableCell>{tr.fromUser}</TableCell>
                  <TableCell>{tr.toUser}</TableCell>
                  <TableCell>{tr.fileId}</TableCell>
                  <TableCell>{statusBadge(tr.status)}</TableCell>
                  <TableCell>{tr.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t('showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} {t('of')} {filtered.length}</p>
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

export default TransfersPage;
