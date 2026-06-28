import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, Check, X, History } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRequestTransferHistories } from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';

const TransferHistoryPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { histories, isLoading } = useRequestTransferHistories();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const mappedHistories = useMemo(() => {
    return (histories as any[]).map((h: any) => {
      const req = h.requestTransfer || {};
      const folder = req.folder || {};
      const createdBy = req.createdBy ? `${req.createdBy.firstName} ${req.createdBy.lastName}` : 'N/A';
      const handledBy = h.handledBy ? `${h.handledBy.firstName} ${h.handledBy.lastName}` : 'N/A';
      const folderLabel = folder.folderNumber 
        ? `${folder.folderNumber}/${folder.folderSymbol || ''}/${folder.folderYear || ''}` 
        : 'N/A';

      return {
        id: String(h.historyId),
        folderLabel,
        fromUser: createdBy,
        toUser: handledBy,
        status: h.status || 'PENDING',
        date: h.requestDate || '',
        purpose: req.purpose || '',
      };
    });
  }, [histories]);

  const filtered = useMemo(() => {
    let result = mappedHistories;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        item.folderLabel.toLowerCase().includes(q) ||
        item.fromUser.toLowerCase().includes(q) ||
        item.toUser.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
    }
    return result;
  }, [mappedHistories, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusFilter = (val: string) => { setStatusFilter(val); setPage(1); };

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    const styles: Record<string, string> = {
      accepted: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
    };
    return (
      <Badge variant="outline" className={`gap-1 ${styles[s] || ''}`}>
        {s === 'accepted' ? <Check className="w-3 h-3" /> : s === 'rejected' ? <X className="w-3 h-3" /> : null}
        {t(status.toUpperCase())}
      </Badge>
    );
  };

  const exportHeaders = [
    { key: 'id', label: t('id') },
    { key: 'folderLabel', label: t('file') },
    { key: 'fromUser', label: t('fromUser') },
    { key: 'toUser', label: t('toUser') },
    { key: 'statusTrans', label: t('status') },
    { key: 'date', label: t('date') },
    { key: 'purpose', label: t('purpose') },
  ];

  const getTranslatedHistories = () => filtered.map(item => ({
    ...item,
    statusTrans: t(item.status.toUpperCase())
  }));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      if (start > 2) {
        pages.push('ellipsis-start');
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in text-start rtl:text-end">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground">{t('transferHistory')}</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> {t('export')}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportToCSV(getTranslatedHistories() as unknown as Record<string, string>[], exportHeaders, 'transfer-history')}>
              <FileSpreadsheet className="w-4 h-4 me-2" /> {t('exportCSV')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => await exportToPDF(getTranslatedHistories() as unknown as Record<string, string>[], exportHeaders, 'transfer-history', t('transferHistory'))}>
              <FileText className="w-4 h-4 me-2" /> {t('exportPDF')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('search')} value={search} onChange={(e) => handleSearch(e.target.value)} className="ps-9" />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={t('filterByStatus')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="accepted">{t('ACCEPTED')}</SelectItem>
            <SelectItem value="rejected">{t('REJECTED')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('id')}</TableHead>
                <TableHead>{t('file')}</TableHead>
                <TableHead>{t('fromUser')}</TableHead>
                <TableHead>{t('toUser')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('purpose')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('noData')}</TableCell></TableRow>
              ) : paginated.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">#{item.id}</TableCell>
                  <TableCell>{item.folderLabel}</TableCell>
                  <TableCell>{item.fromUser}</TableCell>
                  <TableCell>{item.toUser}</TableCell>
                  <TableCell>{statusBadge(item.status)}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.purpose || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t('showing')} {filtered.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} {t('of')} {filtered.length}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('itemsPerPage')}</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
              {getPageNumbers().map((p, idx) => {
                if (p === 'ellipsis-start' || p === 'ellipsis-end') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground select-none">
                      ...
                    </span>
                  );
                }
                const pageNum = p as number;
                return (
                  <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(pageNum)}>{pageNum}</Button>
                );
              })}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TransferHistoryPage;
